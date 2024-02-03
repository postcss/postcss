// @ts-ignore type definitions for nanodelay@1 are wrong.
import { delay } from 'nanodelay'
import { basename, resolve } from 'path'
import { test } from 'uvu'
import { equal, is, throws, type } from 'uvu/assert'

import postcss, {
  AnyNode,
  AtRule,
  Container,
  Declaration,
  Helpers,
  Plugin,
  PluginCreator,
  Root,
  Rule
} from '../lib/postcss.js'

function hasAlready(parent: Container | undefined, selector: string): boolean {
  if (typeof parent === 'undefined') return false
  return parent.nodes?.some(i => {
    return i.type === 'rule' && i.selectors.includes(selector)
  }) ?? false
}

function addIndex(array: any[][]): any[][] {
  return array.map((i, index) => {
    return [index, ...i]
  })
}

function buildVisitor(): [[string, string][], Plugin] {
  let visits: [string, string][] = []
  let visitor: Plugin = {
    AtRule(i) {
      visits.push(['AtRule', i.name])
    },
    AtRuleExit(i) {
      visits.push(['AtRuleExit', i.name])
    },
    Comment(i) {
      visits.push(['Comment', i.text])
    },
    CommentExit(i) {
      visits.push(['CommentExit', i.text])
    },
    Declaration(i) {
      visits.push(['Declaration', i.prop + ': ' + i.value])
    },
    DeclarationExit(i) {
      visits.push(['DeclarationExit', i.prop + ': ' + i.value])
    },
    Document(i) {
      visits.push(['Document', `${i.nodes.length}`])
    },
    DocumentExit(i) {
      visits.push(['DocumentExit', `${i.nodes.length}`])
    },
    Once(i) {
      visits.push(['Once', `${i.nodes.length}`])
    },
    OnceExit(i) {
      visits.push(['OnceExit', `${i.nodes.length}`])
    },
    postcssPlugin: 'visitor',
    Root(i) {
      visits.push(['Root', `${i.nodes.length}`])
    },
    RootExit(i) {
      visits.push(['RootExit', `${i.nodes.length}`])
    },
    Rule(i) {
      visits.push(['Rule', i.selector])
    },
    RuleExit(i) {
      visits.push(['RuleExit', i.selector])
    }
  }
  return [visits, visitor]
}

let replaceColorGreenClassic: Plugin = {
  Once(root) {
    root.walkDecls('color', decl => {
      decl.value = 'green'
    })
  },
  postcssPlugin: 'replace-color'
}

let willChangeVisitor: Plugin = {
  Declaration(node) {
    if (node.prop !== 'will-change') return
    if (!node.parent) return

    let already = node.parent.some(i => {
      return i.type === 'decl' && i.prop === 'backface-visibility'
    })
    if (already) return

    node.cloneBefore({ prop: 'backface-visibility', value: 'hidden' })
  },
  postcssPlugin: 'will-change'
}

let addPropsVisitor: Plugin = {
  Declaration(node) {
    if (node.prop !== 'will-change') return

    node.root().walkDecls('color', decl => {
      if (!decl.parent) return
      let already = decl.parent.some(i => {
        return i.type === 'decl' && i.prop === 'will-change'
      })
      if (already) return

      decl.cloneBefore({ prop: 'will-change', value: 'transform' })
    })
  },
  postcssPlugin: 'add-props'
}

let replaceAllButRedToGreen: Plugin = {
  Declaration(node) {
    if (node.prop === 'color' && node.value !== 'red') {
      node.value = 'green'
    }
  },
  postcssPlugin: 'replace-not-red-to-green'
}

let replaceGreenToRed: Plugin = {
  Declaration(node) {
    if (node.prop === 'color' && node.value === 'green') {
      node.value = 'red'
    }
  },
  postcssPlugin: 'replace-green-to-red'
}

let replacePrintToMobile: Plugin = {
  AtRule(node) {
    if (node.params === '(print)') {
      node.params = '(mobile)'
    }
  },
  postcssPlugin: 'replace-to-mobile'
}

let replaceScreenToPrint: Plugin = {
  AtRule(node) {
    if (node.params === '(screen)') {
      node.params = '(print)'
    }
  },
  postcssPlugin: 'replace-to-print'
}

let postcssFocus: Plugin = {
  postcssPlugin: 'postcss-focus',
  Rule(rule) {
    if (rule.selector.includes(':hover')) {
      let focuses: string[] = []
      rule.selectors.forEach(selector => {
        if (selector.includes(':hover')) {
          let replaced = selector.replace(/:hover/g, ':focus')
          if (!hasAlready(rule.parent, replaced)) {
            focuses.push(replaced)
          }
        }
      })
      if (focuses.length) {
        rule.selectors = rule.selectors.concat(focuses)
      }
    }
  }
}

let hidden: Plugin = {
  Declaration(decl) {
    if (decl.prop !== 'display') return

    let value = decl.value
    let rule = decl.parent as Rule

    if (value.includes('disappear')) {
      decl.cloneBefore({
        prop: 'display',
        value: 'none !important'
      })
      decl.cloneBefore({
        prop: 'visibility',
        value: 'hidden'
      })

      decl.remove()
    }

    if (value.includes('hidden')) {
      let ruleSelectors = rule.selectors.map(i => {
        return `${i}.focusable:active,${i}.focusable:focus`
      })

      let newRule = rule.cloneAfter({ selectors: ruleSelectors }).removeAll()
      newRule.append('display: table; position: static; clear: both;')

      decl.cloneBefore({ prop: 'position', value: 'absolute' })
      decl.cloneBefore({ prop: 'width', value: '1px' })
      decl.cloneBefore({ prop: 'height', value: '1px' })
      decl.cloneBefore({ prop: 'margin', value: '-1px' })
      decl.cloneBefore({ prop: 'padding', value: '0' })
      decl.cloneBefore({ prop: 'border', value: '0' })
      decl.cloneBefore({ prop: 'overflow', value: 'hidden' })
      decl.cloneBefore({ prop: 'clip', value: 'rect(0 0 0 0)' })
      decl.remove()
    }

    if (value.includes('invisible')) {
      decl.cloneBefore({ prop: 'visibility', value: 'hidden' })
      decl.remove()
    }
  },
  postcssPlugin: 'hidden'
}

function createPlugin(creator: () => Plugin): PluginCreator<void> {
  let result = creator as PluginCreator<void>
  result.postcss = true
  return result
}

let postcssAlias = createPlugin(() => {
  let aliases: any = {}
  return {
    Declaration(decl) {
      let value = aliases[decl.prop]
      if (value !== undefined) {
        decl.replaceWith({
          important: decl.important,
          prop: value,
          value: decl.value
        })
      }
    },
    Once(root) {
      root.walkAtRules('alias', rule => {
        rule.walkDecls(decl => {
          aliases[decl.prop] = decl.value
        })
        rule.remove()
      })
    },
    postcssPlugin: 'postcss-alias'
  }
})

test('works classic plugin replace-color', async () => {
  let { css } = await postcss([replaceColorGreenClassic]).process(
    '.a{ color: red; } ' + '.b{ will-change: transform; }',
    {
      from: 'a.css'
    }
  )
  is(css, '.a{ color: green; } ' + '.b{ will-change: transform; }')
})

test('works visitor plugin will-change', async () => {
  let { css } = postcss([willChangeVisitor]).process(
    '.foo { will-change: transform; }',
    { from: 'a.css' }
  )
  is(css, '.foo { backface-visibility: hidden; will-change: transform; }')
})

test('works visitor plugin add-prop', async () => {
  let { css } = await postcss([addPropsVisitor]).process(
    '.a{ color: red; } .b{ will-change: transform; }',
    {
      from: 'a.css'
    }
  )
  is(
    css,
    '.a{ will-change: transform; color: red; } ' +
      '.b{ will-change: transform; }'
  )
})

test('works visitor plugin add-prop in document with single root', async () => {
  let document = postcss.document({
    nodes: [postcss.parse('.a{ color: red; } .b{ will-change: transform; }')]
  })

  let { css } = await postcss([addPropsVisitor]).process(document, {
    from: 'a.css'
  })
  is(
    css,
    '.a{ will-change: transform; color: red; } ' +
      '.b{ will-change: transform; }'
  )
})

test('works visitor plugin add-prop in document with two roots', async () => {
  let document = postcss.document({
    nodes: [
      postcss.parse('.a{ color: red; }'),
      postcss.parse('.b{ will-change: transform; }')
    ]
  })

  let { css } = await postcss([addPropsVisitor]).process(document, {
    from: 'a.css'
  })
  is(css, '.a{ color: red; }' + '.b{ will-change: transform; }')
})

test('works with at-rule params', () => {
  let { css } = postcss([replacePrintToMobile, replaceScreenToPrint]).process(
    '@media (screen) {}',
    { from: 'a.css' }
  )
  is(css, '@media (mobile) {}')
})

test('wraps node to proxies', () => {
  let proxy: any
  let root: Root | undefined
  postcss({
    Once(node) {
      root = node
    },
    postcssPlugin: 'proxyCatcher',
    Rule(node) {
      proxy = node
    }
  }).process('a{color:black}', { from: 'a.css' }).css
  if (!root) throw new Error('Nodes were not catched')
  let rule = root.first as Rule
  equal(proxy.proxyOf, rule)
  equal(proxy.root().proxyOf, rule.root())
  equal(proxy.nodes[0].proxyOf, rule.first)
  equal(proxy.first.proxyOf, rule.first)
  type(proxy.unknown, 'undefined')
  is(
    proxy.some((decl: Declaration) => decl.prop === 'color'),
    true
  )
  is(
    proxy.every((decl: Declaration) => decl.prop === 'color'),
    true
  )
  let props: string[] = []
  proxy.walkDecls((decl: Declaration) => props.push(decl.prop))
  equal(props, ['color'])
})

const cssThree = '.a{ color: red; } .b{ will-change: transform; }'

const expectedThree =
  '.a{ ' +
  'backface-visibility: hidden; ' +
  'will-change: transform; ' +
  'color: green; ' +
  '} ' +
  '.b{ backface-visibility: hidden; will-change: transform; }'

test('work of three plug-ins; sequence 1', async () => {
  let { css } = await postcss([
    replaceColorGreenClassic,
    willChangeVisitor,
    addPropsVisitor
  ]).process(cssThree, { from: 'a.css' })
  is(css, expectedThree)
})

test('work of three plug-ins; sequence 2', async () => {
  let { css } = await postcss([
    addPropsVisitor,
    replaceColorGreenClassic,
    willChangeVisitor
  ]).process(cssThree, { from: 'a.css' })
  is(css, expectedThree)
})

const cssThreeDocument = postcss.document({
  nodes: [
    postcss.parse('.a{ color: red; }'),
    postcss.parse('.b{ will-change: transform; }')
  ]
})

const expectedThreeDocument =
  '.a{ color: green; }' +
  '.b{ backface-visibility: hidden; will-change: transform; }'

test('work of three plug-ins in a document; sequence 1', async () => {
  let { css } = await postcss([
    replaceColorGreenClassic,
    willChangeVisitor,
    addPropsVisitor
  ]).process(cssThreeDocument, { from: 'a.css' })
  is(css, expectedThreeDocument)
})

test('work of three plug-ins in a document; sequence 2', async () => {
  let { css } = await postcss([
    addPropsVisitor,
    replaceColorGreenClassic,
    willChangeVisitor
  ]).process(cssThreeDocument, { from: 'a.css' })
  is(css, expectedThreeDocument)
})

const cssThroughProps = '.a{color: yellow;}'
const expectedThroughProps = '.a{color: red;}'

test('change in node values through props; sequence 1', async () => {
  let { css } = await postcss([
    replaceGreenToRed,
    replaceAllButRedToGreen
  ]).process(cssThroughProps, { from: 'a.css' })
  is(css, expectedThroughProps)
})

test('change in node values through props; sequence 2', async () => {
  let { css } = await postcss([
    replaceAllButRedToGreen,
    replaceGreenToRed
  ]).process(cssThroughProps, { from: 'a.css' })
  is(css, expectedThroughProps)
})

test('works visitor plugin postcss-focus', async () => {
  let input = '*:focus { outline: 0; }.button:hover { background: red; }'
  let expected =
    '*:focus { outline: 0; }' +
    '.button:hover, .button:focus { background: red; }'
  let { css } = await postcss([postcssFocus]).process(input, { from: 'a.css' })
  is(css, expected)
})

test('works visitor plugin hidden', async () => {
  let input = 'h2{' + 'display: hidden;' + '}'

  let expected =
    'h2{' +
    'position: absolute;' +
    'width: 1px;' +
    'height: 1px;' +
    'margin: -1px;' +
    'padding: 0;' +
    'border: 0;' +
    'overflow: hidden;' +
    'clip: rect(0 0 0 0);' +
    '}' +
    'h2.focusable:active,' +
    'h2.focusable:focus{' +
    'display: table;' +
    'position: static;' +
    'clear: both;' +
    '}'

  let { css } = await postcss([hidden]).process(input, { from: 'a.css' })
  is(css, expected)
})

let cssFocusHidden =
  '*:focus { outline: 0; }' +
  '.button:hover { background: red; }' +
  'h2:hover{' +
  'display: hidden;' +
  '}'

let expectedFocusHidden =
  '*:focus { outline: 0; }' +
  '.button:hover, .button:focus { background: red; }' +
  'h2:hover,h2:focus{' +
  'position: absolute;' +
  'width: 1px;' +
  'height: 1px;' +
  'margin: -1px;' +
  'padding: 0;' +
  'border: 0;' +
  'overflow: hidden;' +
  'clip: rect(0 0 0 0);' +
  '}' +
  'h2:hover.focusable:active,' +
  'h2:hover.focusable:focus,' +
  'h2:focus.focusable:active,' +
  'h2:focus.focusable:focus{' +
  'display: table;' +
  'position: static;' +
  'clear: both;' +
  '}'

test('works visitor plugins postcss-focus and hidden; sequence 1', async () => {
  let { css } = await postcss([hidden, postcssFocus]).process(cssFocusHidden, {
    from: 'a.css'
  })
  is(css, expectedFocusHidden)
})

test('works visitor plugins postcss-focus and hidden; sequence 2', async () => {
  let { css } = await postcss([postcssFocus, hidden]).process(cssFocusHidden, {
    from: 'a.css'
  })
  is(css, expectedFocusHidden)
})

test('works visitor plugin postcss-alias', async () => {
  let input =
    '@alias { fs: font-size; bg: background; }' +
    '.aliased { fs: 16px; bg: white; }'
  let expected = '.aliased { font-size: 16px; background: white; }'
  let { css } = postcss([postcssAlias]).process(input, { from: 'a.css' })
  is(css, expected)
})

test('adds plugin to error', async () => {
  let broken: Plugin = {
    postcssPlugin: 'broken',
    Rule(rule) {
      throw rule.error('test')
    }
  }
  let error: any
  try {
    postcss([broken]).process('a{}', { from: 'broken.css' }).css
  } catch (e) {
    error = e
  }
  is(error.message, `broken: ${resolve('broken.css')}:1:1: test`)
  is(error.postcssNode.toString(), 'a{}')
  is(error.stack.includes('broken.css:1:1'), true)
})

test('adds plugin to async error', async () => {
  let broken: Plugin = {
    postcssPlugin: 'broken',
    async Rule(rule) {
      await delay(1)
      throw rule.error('test')
    }
  }
  let error: any
  try {
    await postcss([broken]).process('a{}', { from: 'broken.css' })
  } catch (e) {
    error = e
  }
  is(error.message, `broken: ${resolve('broken.css')}:1:1: test`)
  is(error.postcssNode.toString(), 'a{}')
  is(error.stack.includes('broken.css:1:1'), true)
})

test('adds sync plugin to async error', async () => {
  let broken: Plugin = {
    postcssPlugin: 'broken',
    Rule(rule) {
      throw rule.error('test')
    }
  }
  let error: any
  try {
    await postcss([broken]).process('a{}', { from: 'broken.css' })
  } catch (e) {
    error = e
  }
  is(error.message, `broken: ${resolve('broken.css')}:1:1: test`)
  is(error.postcssNode.toString(), 'a{}')
  is(error.stack.includes('broken.css:1:1'), true)
})

test('adds node to error', async () => {
  let broken: Plugin = {
    postcssPlugin: 'broken',
    Rule() {
      throw new Error('test')
    }
  }
  let error: any
  try {
    postcss([broken]).process('a{}', { from: 'broken.css' }).css
  } catch (e) {
    error = e
  }
  is(error.message, 'test')
  is(error.postcssNode.toString(), 'a{}')
  is(error.stack.includes('broken.css:1:1'), true)
})

test('adds node to async error', async () => {
  let broken: Plugin = {
    postcssPlugin: 'broken',
    async Rule() {
      await delay(1)
      throw new Error('test')
    }
  }
  let error: any
  try {
    await postcss([broken]).process('a{}', { from: 'broken.css' })
  } catch (e) {
    error = e
  }
  is(error.message, 'test')
  is(error.postcssNode.toString(), 'a{}')
  is(error.stack.includes('broken.css:1:1'), true)
})

test('shows error on sync call async plugins', () => {
  let asyncPlugin: Plugin = {
    postcssPlugin: 'asyncPlugin',
    async Rule() {}
  }
  let error: any
  try {
    postcss([asyncPlugin]).process('a{}', { from: 'broken.css' }).css
  } catch (e) {
    error = e
  }
  is(error.message.includes('work with async plugins'), true)
})

test('passes helpers', async () => {
  function check(node: AnyNode, helpers: Helpers): void {
    equal(helpers.result.messages, [])
    is(typeof helpers.postcss, 'function')
    is(helpers.comment().type, 'comment')
    is(new helpers.Comment().type, 'comment')
    equal(helpers.list, postcss.list)
  }

  let syncPlugin: Plugin = {
    Once: check,
    OnceExit: check,
    postcssPlugin: 'syncPlugin',
    Rule: check,
    RuleExit: check
  }

  let asyncPlugin: Plugin = {
    async Once(node, helpers) {
      await delay(1)
      check(node, helpers)
    },
    async OnceExit(node, helpers) {
      await delay(1)
      check(node, helpers)
    },
    postcssPlugin: 'syncPlugin',
    async Rule(node, helpers) {
      await delay(1)
      check(node, helpers)
    }
  }

  postcss([syncPlugin]).process('a{}', { from: 'a.css' }).css
  await postcss([asyncPlugin]).process('a{}', { from: 'a.css' })
})

test('passes helpers in a document', async () => {
  function check(node: AnyNode, helpers: Helpers): void {
    equal(helpers.result.messages, [])
    type(helpers.postcss, 'function')
    is(helpers.comment().type, 'comment')
    is(new helpers.Comment().type, 'comment')
    equal(helpers.list, postcss.list)
  }

  let syncPlugin: Plugin = {
    Once: check,
    OnceExit: check,
    postcssPlugin: 'syncPlugin',
    Rule: check,
    RuleExit: check
  }

  let asyncPlugin: Plugin = {
    async Once(node, helpers) {
      await delay(1)
      check(node, helpers)
    },
    async OnceExit(node, helpers) {
      await delay(1)
      check(node, helpers)
    },
    postcssPlugin: 'syncPlugin',
    async Rule(node, helpers) {
      await delay(1)
      check(node, helpers)
    }
  }

  postcss([syncPlugin]).process(
    postcss.document({ nodes: [postcss.parse('a{}')] }),
    { from: 'a.css' }
  ).css
  await postcss([asyncPlugin]).process(
    postcss.document({ nodes: [postcss.parse('a{}')] }),
    { from: 'a.css' }
  )
})

test('detects non-changed values', () => {
  let plugin: Plugin = {
    Declaration(decl) {
      decl.value = 'red'
    },
    postcssPlugin: 'test'
  }
  is(
    postcss([plugin]).process('a{ color: black; background: white; }', {
      from: 'a.css'
    }).css,
    'a{ color: red; background: red; }'
  )
})

test('allows runtime listeners', () => {
  let root = false
  let plugin: Plugin = {
    Declaration(decl) {
      decl.value = 'red'
    },
    postcssPlugin: 'test',
    prepare(result) {
      return {
        Once() {
          root = true
        },
        Rule(rule) {
          rule.selector = basename(result.opts.from ?? '')
        }
      }
    }
  }
  is(
    postcss([plugin]).process('a{ color: black }', { from: 'a.css' }).css,
    'a.css{ color: red }'
  )
  is(root, true)
})

test('works correctly with nodes changes', () => {
  let plugin: Plugin = {
    postcssPlugin: 'test',
    Rule(rule) {
      if (!rule.some(i => i.type === 'decl' && i.prop === 'z-index')) {
        rule.prepend({ prop: 'z-index', value: '1' })
      }
    }
  }
  is(
    postcss([plugin]).process('a{ color: black }', { from: 'a.css' }).css,
    'a{ z-index: 1; color: black }'
  )
})

test('throws error on unknown plugin property', () => {
  let plugin: any = {
    NO: true,
    postcssPlugin: 'test'
  }
  throws(() => {
    postcss([plugin]).process('').css
  }, /Unknown event NO in test\. Try to update PostCSS \(\d/)
})

test('unwraps nodes on inserting', () => {
  let moveNode: Plugin = {
    Declaration: {
      color: decl => {
        if (decl.parent?.type !== 'root') {
          decl.root().append(decl)
        }
      }
    },
    postcssPlugin: 'moveNode'
  }

  let root = postcss([moveNode]).process('a{color:red}').root
  equal((root.last as any).proxyOf, root.last)
})

let redToGreen: Plugin = {
  Declaration: {
    color: decl => {
      if (decl.value === 'red') {
        decl.value = 'green'
      }
    }
  },
  postcssPlugin: 'redToGreen'
}

let greenToBlue: Plugin = {
  Declaration(decl) {
    if (decl.value === 'green') {
      decl.value = 'blue'
    }
  },
  postcssPlugin: 'greenToBlue'
}

let fooToBar: Plugin = {
  postcssPlugin: 'fooToBar',
  Rule(rule) {
    if (rule.selector === '.foo') {
      rule.selectors = ['.bar']
    }
  }
}

let mixins: Plugin = {
  postcssPlugin: 'mixin',
  prepare() {
    let mixin: AnyNode | undefined
    return {
      AtRule: {
        'apply-mixin': atRule => {
          if (mixin) atRule.replaceWith(mixin)
        },
        'define-mixin': atRule => {
          if (atRule.first) mixin = atRule.first
          atRule.remove()
        }
      }
    }
  }
}

let insertFirst: Plugin = {
  AtRule: {
    'insert-first': atRule => {
      let first = atRule.root().first
      if (first) atRule.replaceWith(first)
    }
  },
  postcssPlugin: 'insertFirst'
}

for (let funcType of ['sync', 'async']) {
  test(`walks ${funcType} through tree`, async () => {
    let [visits, visitor] = buildVisitor()
    let processor = postcss([visitor]).process(
      `@media screen {
        body {
          /* comment */
          background: white;
          padding: 10px;
        }
        a {
          color: blue;
        }
      }`,
      { from: 'a.css' }
    )
    if (funcType === 'sync') {
      processor.css
    } else {
      await processor
    }
    equal(
      addIndex(visits),
      addIndex([
        ['Once', '1'],
        ['Root', '1'],
        ['AtRule', 'media'],
        ['Rule', 'body'],
        ['Comment', 'comment'],
        ['CommentExit', 'comment'],
        ['Declaration', 'background: white'],
        ['DeclarationExit', 'background: white'],
        ['Declaration', 'padding: 10px'],
        ['DeclarationExit', 'padding: 10px'],
        ['RuleExit', 'body'],
        ['Rule', 'a'],
        ['Declaration', 'color: blue'],
        ['DeclarationExit', 'color: blue'],
        ['RuleExit', 'a'],
        ['AtRuleExit', 'media'],
        ['RootExit', '1'],
        ['OnceExit', '1']
      ])
    )
  })

  test(`walks ${funcType} through tree in a document`, async () => {
    let document = postcss.document({
      nodes: [
        postcss.parse(`@media screen {
          body {
            /* comment */
            background: white;
            padding: 10px;
          }
          a {
            color: blue;
          }
        }`)
      ]
    })

    let [visits, visitor] = buildVisitor()
    let processor = postcss([visitor]).process(document, { from: 'a.css' })
    if (funcType === 'sync') {
      processor.css
    } else {
      await processor
    }

    equal(
      addIndex(visits),
      addIndex([
        ['Once', '1'],
        ['Document', '1'],
        ['Root', '1'],
        ['AtRule', 'media'],
        ['Rule', 'body'],
        ['Comment', 'comment'],
        ['CommentExit', 'comment'],
        ['Declaration', 'background: white'],
        ['DeclarationExit', 'background: white'],
        ['Declaration', 'padding: 10px'],
        ['DeclarationExit', 'padding: 10px'],
        ['RuleExit', 'body'],
        ['Rule', 'a'],
        ['Declaration', 'color: blue'],
        ['DeclarationExit', 'color: blue'],
        ['RuleExit', 'a'],
        ['AtRuleExit', 'media'],
        ['RootExit', '1'],
        ['DocumentExit', '1'],
        ['OnceExit', '1']
      ])
    )
  })

  test(`walks ${funcType} during transformations`, async () => {
    let [visits, visitor] = buildVisitor()
    let result = postcss([
      visitor,
      redToGreen,
      greenToBlue,
      mixins,
      fooToBar,
      insertFirst
    ]).process(
      `.first {
          color: red;
        }
        @define-mixin {
          b {
            color: red;
          }
        }
        a {
          color: red;
        }
        @media (screen) {
          @insert-first;
        }
        .foo {
          background: red;
        }
        @apply-mixin;`,
      { from: 'a.css' }
    )
    let output
    if (funcType === 'sync') {
      output = result.css
    } else {
      output = (await result).css
    }
    is(
      output,
      `a {
          color: blue;
        }
        @media (screen) {.first {
          color: blue;
        }
        }
        .bar {
          background: red;
        }
        b {
            color: blue;
          }`
    )
    equal(
      addIndex(visits),
      addIndex([
        ['Once', '6'],
        ['Root', '6'],
        ['Rule', '.first'],
        ['Declaration', 'color: red'],
        ['DeclarationExit', 'color: green'],
        ['RuleExit', '.first'],
        ['AtRule', 'define-mixin'],
        ['Rule', 'a'],
        ['Declaration', 'color: red'],
        ['DeclarationExit', 'color: green'],
        ['RuleExit', 'a'],
        ['AtRule', 'media'],
        ['AtRule', 'insert-first'],
        ['AtRuleExit', 'media'],
        ['Rule', '.foo'],
        ['Declaration', 'background: red'],
        ['DeclarationExit', 'background: red'],
        ['RuleExit', '.bar'],
        ['AtRule', 'apply-mixin'],
        ['RootExit', '4'],
        ['Root', '4'],
        ['Rule', 'a'],
        ['Declaration', 'color: green'],
        ['DeclarationExit', 'color: blue'],
        ['RuleExit', 'a'],
        ['AtRule', 'media'],
        ['Rule', '.first'],
        ['Declaration', 'color: green'],
        ['DeclarationExit', 'color: blue'],
        ['RuleExit', '.first'],
        ['AtRuleExit', 'media'],
        ['Rule', 'b'],
        ['Declaration', 'color: red'],
        ['DeclarationExit', 'color: green'],
        ['RuleExit', 'b'],
        ['RootExit', '4'],
        ['Root', '4'],
        ['Rule', 'a'],
        ['Declaration', 'color: blue'],
        ['DeclarationExit', 'color: blue'],
        ['RuleExit', 'a'],
        ['AtRule', 'media'],
        ['Rule', '.first'],
        ['Declaration', 'color: blue'],
        ['DeclarationExit', 'color: blue'],
        ['RuleExit', '.first'],
        ['AtRuleExit', 'media'],
        ['Rule', 'b'],
        ['Declaration', 'color: green'],
        ['DeclarationExit', 'color: blue'],
        ['RuleExit', 'b'],
        ['RootExit', '4'],
        ['Root', '4'],
        ['Rule', 'b'],
        ['Declaration', 'color: blue'],
        ['DeclarationExit', 'color: blue'],
        ['RuleExit', 'b'],
        ['RootExit', '4'],
        ['OnceExit', '4']
      ])
    )
  })

  test(`walks ${funcType} during transformations in a document`, async () => {
    let document = postcss.document({
      nodes: [
        postcss.parse(
          `.first {
            color: red;
          }
          @define-mixin {
            b {
              color: red;
            }
          }
          a {
            color: red;
          }
          @media (screen) {
            @insert-first;
          }
          .foo {
            background: red;
          }
          @apply-mixin;`
        )
      ]
    })

    let [visits, visitor] = buildVisitor()
    let result = postcss([
      visitor,
      redToGreen,
      greenToBlue,
      mixins,
      fooToBar,
      insertFirst
    ]).process(document, { from: 'a.css' })
    let output
    if (funcType === 'sync') {
      output = result.css
    } else {
      output = (await result).css
    }

    is(
      output,
      `a {
            color: blue;
          }
          @media (screen) {.first {
            color: blue;
          }
          }
          .bar {
            background: red;
          }
          b {
              color: blue;
            }`
    )
    equal(
      addIndex(visits),
      addIndex([
        ['Once', '6'],
        ['Document', '1'],
        ['Root', '6'],
        ['Rule', '.first'],
        ['Declaration', 'color: red'],
        ['DeclarationExit', 'color: green'],
        ['RuleExit', '.first'],
        ['AtRule', 'define-mixin'],
        ['Rule', 'a'],
        ['Declaration', 'color: red'],
        ['DeclarationExit', 'color: green'],
        ['RuleExit', 'a'],
        ['AtRule', 'media'],
        ['AtRule', 'insert-first'],
        ['AtRuleExit', 'media'],
        ['Rule', '.foo'],
        ['Declaration', 'background: red'],
        ['DeclarationExit', 'background: red'],
        ['RuleExit', '.bar'],
        ['AtRule', 'apply-mixin'],
        ['RootExit', '4'],
        ['DocumentExit', '1'],
        ['Document', '1'],
        ['Root', '4'],
        ['Rule', 'a'],
        ['Declaration', 'color: green'],
        ['DeclarationExit', 'color: blue'],
        ['RuleExit', 'a'],
        ['AtRule', 'media'],
        ['Rule', '.first'],
        ['Declaration', 'color: green'],
        ['DeclarationExit', 'color: blue'],
        ['RuleExit', '.first'],
        ['AtRuleExit', 'media'],
        ['Rule', 'b'],
        ['Declaration', 'color: red'],
        ['DeclarationExit', 'color: green'],
        ['RuleExit', 'b'],
        ['RootExit', '4'],
        ['DocumentExit', '1'],
        ['Document', '1'],
        ['Root', '4'],
        ['Rule', 'a'],
        ['Declaration', 'color: blue'],
        ['DeclarationExit', 'color: blue'],
        ['RuleExit', 'a'],
        ['AtRule', 'media'],
        ['Rule', '.first'],
        ['Declaration', 'color: blue'],
        ['DeclarationExit', 'color: blue'],
        ['RuleExit', '.first'],
        ['AtRuleExit', 'media'],
        ['Rule', 'b'],
        ['Declaration', 'color: green'],
        ['DeclarationExit', 'color: blue'],
        ['RuleExit', 'b'],
        ['RootExit', '4'],
        ['DocumentExit', '1'],
        ['Document', '1'],
        ['Root', '4'],
        ['Rule', 'b'],
        ['Declaration', 'color: blue'],
        ['DeclarationExit', 'color: blue'],
        ['RuleExit', 'b'],
        ['RootExit', '4'],
        ['DocumentExit', '1'],
        ['OnceExit', '4']
      ])
    )
  })

  test(`has ${funcType} property and at-rule name filters`, async () => {
    let filteredDecls: string[] = []
    let allDecls: string[] = []
    let filteredAtRules: string[] = []
    let allAtRules: string[] = []
    let allExits: string[] = []
    let filteredExits: string[] = []

    let scanner: Plugin = {
      AtRule: {
        '*': atRule => {
          allAtRules.push(atRule.name)
        },
        'media': atRule => {
          filteredAtRules.push(atRule.name)
        }
      },
      Declaration: {
        '*': decl => {
          allDecls.push(decl.prop)
        },
        'color': decl => {
          filteredDecls.push(decl.prop)
        }
      },
      DeclarationExit: {
        '*': decl => {
          allExits.push(decl.prop)
        },
        'color': decl => {
          filteredExits.push(decl.prop)
        }
      },
      postcssPlugin: 'test'
    }

    let result = postcss([scanner]).process(
      `@charset "UTF-8"; @media (screen) { COLOR: black; z-index: 1 }`,
      { from: 'a.css' }
    )
    if (funcType === 'sync') {
      result.css
    } else {
      await result
    }

    equal(filteredDecls, ['COLOR'])
    equal(allDecls, ['COLOR', 'z-index'])
    equal(filteredExits, ['COLOR'])
    equal(allExits, ['COLOR', 'z-index'])
    equal(filteredAtRules, ['media'])
    equal(allAtRules, ['charset', 'media'])
  })

  test(`has ${funcType} property and at-rule name filters in a document`, async () => {
    let filteredDecls: string[] = []
    let allDecls: string[] = []
    let filteredAtRules: string[] = []
    let allAtRules: string[] = []
    let allExits: string[] = []
    let filteredExits: string[] = []

    let scanner: Plugin = {
      AtRule: {
        '*': atRule => {
          allAtRules.push(atRule.name)
        },
        'media': atRule => {
          filteredAtRules.push(atRule.name)
        }
      },
      Declaration: {
        '*': decl => {
          allDecls.push(decl.prop)
        },
        'color': decl => {
          filteredDecls.push(decl.prop)
        }
      },
      DeclarationExit: {
        '*': decl => {
          allExits.push(decl.prop)
        },
        'color': decl => {
          filteredExits.push(decl.prop)
        }
      },
      postcssPlugin: 'test'
    }

    let document = postcss.document({
      nodes: [
        postcss.parse(
          `@charset "UTF-8"; @media (screen) { COLOR: black; z-index: 1 }`
        )
      ]
    })

    let result = postcss([scanner]).process(document, { from: 'a.css' })
    if (funcType === 'sync') {
      result.css
    } else {
      await result
    }

    equal(filteredDecls, ['COLOR'])
    equal(allDecls, ['COLOR', 'z-index'])
    equal(filteredExits, ['COLOR'])
    equal(allExits, ['COLOR', 'z-index'])
    equal(filteredAtRules, ['media'])
    equal(allAtRules, ['charset', 'media'])
  })

  test(`has ${funcType} OnceExit listener`, async () => {
    let rootExit = 0
    let OnceExit = 0

    let plugin: Plugin = {
      OnceExit() {
        OnceExit += 1
      },
      postcssPlugin: 'test',
      RootExit() {
        rootExit += 1
      },
      Rule(rule) {
        rule.remove()
      }
    }

    let result = postcss([plugin]).process('a{}', { from: 'a.css' })

    if (funcType === 'sync') {
      result.css
    } else {
      await result
    }

    is(rootExit, 2)
    is(OnceExit, 1)
  })

  test(`has ${funcType} OnceExit listener in a document with one root`, async () => {
    let RootExit = 0
    let OnceExit = 0
    let DocumentExit = 0

    let plugin: Plugin = {
      DocumentExit() {
        DocumentExit += 1
      },
      OnceExit() {
        OnceExit += 1
      },
      postcssPlugin: 'test',
      RootExit() {
        RootExit += 1
      },
      Rule(rule) {
        rule.remove()
      }
    }

    let document = postcss.document({
      nodes: [postcss.parse('a{}')]
    })

    let result = postcss([plugin]).process(document, { from: 'a.css' })

    if (funcType === 'sync') {
      result.css
    } else {
      await result
    }

    is(RootExit, 2)
    is(DocumentExit, 2)
    is(OnceExit, 1)
  })

  test(`has ${funcType} OnceExit listener in a document with two roots`, async () => {
    let RootExit = 0
    let OnceExit = 0
    let DocumentExit = 0

    let plugin: Plugin = {
      DocumentExit() {
        DocumentExit += 1
      },
      OnceExit() {
        OnceExit += 1
      },
      postcssPlugin: 'test',
      RootExit() {
        RootExit += 1
      },
      Rule(rule) {
        rule.remove()
      }
    }

    let document = postcss.document({
      nodes: [postcss.parse('a{}'), postcss.parse('b{}')]
    })

    let result = postcss([plugin]).process(document, { from: 'a.css' })

    if (funcType === 'sync') {
      result.css
    } else {
      await result
    }

    is(RootExit, 4)
    is(DocumentExit, 2)
    is(OnceExit, 2) // 2 roots === 2 OnceExit
  })
}

test('throws error from async OnceExit', async () => {
  let plugin: Plugin = {
    OnceExit() {
      throw new Error('test Exit error')
    },
    postcssPlugin: 'test'
  }

  let result = postcss([plugin]).process('a{ color: black }', {
    from: 'a.css'
  })

  let error: any
  try {
    await result
  } catch (e) {
    error = e
  }

  is(error.message, 'test Exit error')
})

test('rescan Root in another processor', () => {
  let [visits, visitor] = buildVisitor()
  let root = postcss([visitor]).process('a{z-index:1}', { from: 'a.css' }).root

  visits.splice(0, visits.length)
  postcss([visitor]).process(root, { from: 'a.css' }).root

  equal(visits, [
    ['Once', '1'],
    ['Root', '1'],
    ['Rule', 'a'],
    ['Declaration', 'z-index: 1'],
    ['DeclarationExit', 'z-index: 1'],
    ['RuleExit', 'a'],
    ['RootExit', '1'],
    ['OnceExit', '1']
  ])
})

test('rescan Root in another processor in a document', () => {
  let [visits, visitor] = buildVisitor()
  let root = postcss([visitor]).process('a{z-index:1}', { from: 'a.css' }).root
  let document = postcss.document({ nodes: [root] })

  visits.splice(0, visits.length)
  postcss([visitor]).process(document, { from: 'a.css' }).root

  equal(visits, [
    ['Once', '1'],
    ['Document', '1'],
    ['Root', '1'],
    ['Rule', 'a'],
    ['Declaration', 'z-index: 1'],
    ['DeclarationExit', 'z-index: 1'],
    ['RuleExit', 'a'],
    ['RootExit', '1'],
    ['DocumentExit', '1'],
    ['OnceExit', '1']
  ])
})

test('marks cleaned nodes as dirty on moving', () => {
  let mover: Plugin = {
    postcssPlugin: 'mover',
    Rule(rule) {
      if (rule.selector === 'b') {
        let a = rule.prev()
        if (a) rule.append(a)
      }
    }
  }

  let [visits, visitor] = buildVisitor()
  postcss([mover, visitor]).process('a { color: black } b { }', {
    from: 'a.css'
  }).root

  equal(visits, [
    ['Once', '2'],
    ['Root', '2'],
    ['Rule', 'a'],
    ['Declaration', 'color: black'],
    ['DeclarationExit', 'color: black'],
    ['RuleExit', 'a'],
    ['Rule', 'b'],
    ['Rule', 'a'],
    ['Declaration', 'color: black'],
    ['DeclarationExit', 'color: black'],
    ['RuleExit', 'a'],
    ['RuleExit', 'b'],
    ['RootExit', '1'],
    ['Root', '1'],
    ['Rule', 'b'],
    ['RuleExit', 'b'],
    ['RootExit', '1'],
    ['OnceExit', '1']
  ])
})

test('marks cleaned nodes as dirty on moving in a document', () => {
  let mover: Plugin = {
    postcssPlugin: 'mover',
    Rule(rule) {
      if (rule.selector === 'b') {
        let a = rule.prev()
        if (a) rule.append(a)
      }
    }
  }
  let [visits, visitor] = buildVisitor()

  let document = postcss.document({
    nodes: [postcss.parse('a { color: black } b { }')]
  })

  postcss([mover, visitor]).process(document, {
    from: 'a.css'
  }).root

  equal(visits, [
    ['Once', '2'],
    ['Document', '1'],
    ['Root', '2'],
    ['Rule', 'a'],
    ['Declaration', 'color: black'],
    ['DeclarationExit', 'color: black'],
    ['RuleExit', 'a'],
    ['Rule', 'b'],
    ['Rule', 'a'],
    ['Declaration', 'color: black'],
    ['DeclarationExit', 'color: black'],
    ['RuleExit', 'a'],
    ['RuleExit', 'b'],
    ['RootExit', '1'],
    ['DocumentExit', '1'],
    ['Document', '1'],
    ['Root', '1'],
    ['Rule', 'b'],
    ['RuleExit', 'b'],
    ['RootExit', '1'],
    ['DocumentExit', '1'],
    ['OnceExit', '1']
  ])
})

test('append works after reassigning nodes through .parent', async () => {
  let plugin: Plugin = {
    OnceExit(root) {
      let firstNode = root.nodes[0] as AtRule
      let secondNode = root.nodes[1] as AtRule
      let rule2 = secondNode.nodes![0]
      rule2.parent!.nodes = rule2.parent!.nodes
      firstNode.append(...secondNode.nodes!)
      secondNode.remove()
    },

    postcssPlugin: 'test',

    Rule(rule) {
      if (
        !(
          rule.selector === '.nested' &&
          rule.nodes.length === 1 &&
          rule.nodes[0].type === 'atrule'
        )
      ) {
        return
      }

      let atrule = rule.nodes[0]

      atrule.append(rule.clone({ nodes: [] }).append(...atrule.nodes!))

      rule.after(atrule)
      rule.remove()
    }
  }

  let { css } = await postcss([plugin]).process(
    postcss.parse(
      `@media (min-width:640px) { .page { width: auto; } } ` +
        `.nested { @media (min-width:640px) { width: auto; } }`
    ),
    { from: 'whatever' }
  )

  is(
    css,
    '@media (min-width:640px) { .page { width: auto; } .nested { width: auto } }'
  )
})

test.run()
