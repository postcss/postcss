import { resolve, basename } from 'path'
import { delay } from 'nanodelay'

import postcss, {
  Container,
  Root,
  Rule,
  Declaration,
  Plugin,
  PluginCreator,
  AnyNode,
  Helpers
} from '../lib/postcss.js'

function hasAlready(parent: Container | undefined, selector: string): boolean {
  if (typeof parent === 'undefined') return false
  return parent.nodes.some(i => {
    return i.type === 'rule' && i.selectors.includes(selector)
  })
}

function addIndex(array: any[][]): any[][] {
  return array.map((i, index) => {
    return [index, ...i]
  })
}

function buildVisitor(): [[string, string][], Plugin] {
  let visits: [string, string][] = []
  let visitor: Plugin = {
    postcssPlugin: 'visitor',
    Document(i) {
      visits.push(['Document', `${i.nodes.length}`])
    },
    Once(i) {
      visits.push(['Once', `${i.nodes.length}`])
    },
    Root(i) {
      visits.push(['Root', `${i.nodes.length}`])
    },
    RootExit(i) {
      visits.push(['RootExit', `${i.nodes.length}`])
    },
    AtRule(i) {
      visits.push(['AtRule', i.name])
    },
    AtRuleExit(i) {
      visits.push(['AtRuleExit', i.name])
    },
    Rule(i) {
      visits.push(['Rule', i.selector])
    },
    RuleExit(i) {
      visits.push(['RuleExit', i.selector])
    },
    Declaration(i) {
      visits.push(['Declaration', i.prop + ': ' + i.value])
    },
    DeclarationExit(i) {
      visits.push(['DeclarationExit', i.prop + ': ' + i.value])
    },
    Comment(i) {
      visits.push(['Comment', i.text])
    },
    CommentExit(i) {
      visits.push(['CommentExit', i.text])
    },
    OnceExit(i) {
      visits.push(['OnceExit', `${i.nodes.length}`])
    },
    DocumentExit(i) {
      visits.push(['DocumentExit', `${i.nodes.length}`])
    }
  }
  return [visits, visitor]
}

let replaceColorGreenClassic: Plugin = {
  postcssPlugin: 'replace-color',
  Once(root) {
    root.walkDecls('color', decl => {
      decl.value = 'green'
    })
  }
}

let willChangeVisitor: Plugin = {
  postcssPlugin: 'will-change',
  Declaration(node) {
    if (node.prop !== 'will-change') return
    if (!node.parent) return

    let already = node.parent.some(i => {
      return i.type === 'decl' && i.prop === 'backface-visibility'
    })
    if (already) return

    node.cloneBefore({ prop: 'backface-visibility', value: 'hidden' })
  }
}

let addPropsVisitor: Plugin = {
  postcssPlugin: 'add-props',
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
  }
}

let replaceAllButRedToGreen: Plugin = {
  postcssPlugin: 'replace-not-red-to-green',
  Declaration(node) {
    if (node.prop === 'color' && node.value !== 'red') {
      node.value = 'green'
    }
  }
}

let replaceGreenToRed: Plugin = {
  postcssPlugin: 'replace-green-to-red',
  Declaration(node) {
    if (node.prop === 'color' && node.value === 'green') {
      node.value = 'red'
    }
  }
}

let replacePrintToMobile: Plugin = {
  postcssPlugin: 'replace-to-mobile',
  AtRule(node) {
    if (node.params === '(print)') {
      node.params = '(mobile)'
    }
  }
}

let replaceScreenToPrint: Plugin = {
  postcssPlugin: 'replace-to-print',
  AtRule(node) {
    if (node.params === '(screen)') {
      node.params = '(print)'
    }
  }
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
  postcssPlugin: 'hidden',
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
  }
}

function createPlugin(creator: () => Plugin): PluginCreator<void> {
  let result = creator as PluginCreator<void>
  result.postcss = true
  return result
}

let postcssAlias = createPlugin(() => {
  let aliases: any = {}
  return {
    postcssPlugin: 'postcss-alias',
    Once(root) {
      root.walkAtRules('alias', rule => {
        rule.walkDecls(decl => {
          aliases[decl.prop] = decl.value
        })
        rule.remove()
      })
    },
    Declaration(decl) {
      let value = aliases[decl.prop]
      if (value !== undefined) {
        decl.replaceWith({
          prop: value,
          value: decl.value,
          important: decl.important
        })
      }
    }
  }
})

it('works classic plugin replace-color', async () => {
  let { css } = await postcss([replaceColorGreenClassic]).process(
    '.a{ color: red; } ' + '.b{ will-change: transform; }',
    {
      from: 'a.css'
    }
  )
  expect(css).toEqual('.a{ color: green; } ' + '.b{ will-change: transform; }')
})

it('works visitor plugin will-change', async () => {
  let { css } = postcss([willChangeVisitor]).process(
    '.foo { will-change: transform; }',
    { from: 'a.css' }
  )
  expect(css).toEqual(
    '.foo { backface-visibility: hidden; will-change: transform; }'
  )
})

it('works visitor plugin add-prop', async () => {
  let { css } = await postcss([addPropsVisitor]).process(
    '.a{ color: red; } .b{ will-change: transform; }',
    {
      from: 'a.css'
    }
  )
  expect(css).toEqual(
    '.a{ will-change: transform; color: red; } ' +
      '.b{ will-change: transform; }'
  )
})

it('works visitor plugin add-prop in document with single root', async () => {
  let document = postcss.document({
    nodes: [postcss.parse('.a{ color: red; } .b{ will-change: transform; }')]
  })

  let { css } = await postcss([addPropsVisitor]).process(document, {
    from: 'a.css'
  })
  expect(css).toEqual(
    '.a{ will-change: transform; color: red; } ' +
      '.b{ will-change: transform; }'
  )
})

it('works visitor plugin add-prop in document with two roots', async () => {
  let document = postcss.document({
    nodes: [
      postcss.parse('.a{ color: red; }'),
      postcss.parse('.b{ will-change: transform; }')
    ]
  })

  let { css } = await postcss([addPropsVisitor]).process(document, {
    from: 'a.css'
  })
  expect(css).toEqual('.a{ color: red; }' + '.b{ will-change: transform; }')
})

it('works with at-rule params', () => {
  let { css } = postcss([replacePrintToMobile, replaceScreenToPrint]).process(
    '@media (screen) {}',
    { from: 'a.css' }
  )
  expect(css).toEqual('@media (mobile) {}')
})

it('wraps node to proxies', () => {
  let proxy: any
  let root: Root | undefined
  postcss({
    postcssPlugin: 'proxyCatcher',
    Once(node) {
      root = node
    },
    Rule(node) {
      proxy = node
    }
  }).process('a{color:black}', { from: 'a.css' }).css
  if (!root) throw new Error('Nodes were not catched')
  let rule = root.first as Rule
  expect(proxy.proxyOf).toBe(rule)
  expect(proxy.root().proxyOf).toBe(rule.root())
  expect(proxy.nodes[0].proxyOf).toBe(rule.first)
  expect(proxy.first.proxyOf).toBe(rule.first)
  expect(proxy.unknown).toBeUndefined()
  expect(proxy.some((decl: Declaration) => decl.prop === 'color')).toBe(true)
  expect(proxy.every((decl: Declaration) => decl.prop === 'color')).toBe(true)
  let props: string[] = []
  proxy.walkDecls((decl: Declaration) => props.push(decl.prop))
  expect(props).toEqual(['color'])
})

const cssThree = '.a{ color: red; } .b{ will-change: transform; }'

const expectedThree =
  '.a{ ' +
  'backface-visibility: hidden; ' +
  'will-change: transform; ' +
  'color: green; ' +
  '} ' +
  '.b{ backface-visibility: hidden; will-change: transform; }'

it('work of three plug-ins; sequence 1', async () => {
  let { css } = await postcss([
    replaceColorGreenClassic,
    willChangeVisitor,
    addPropsVisitor
  ]).process(cssThree, { from: 'a.css' })
  expect(css).toEqual(expectedThree)
})

it('work of three plug-ins; sequence 2', async () => {
  let { css } = await postcss([
    addPropsVisitor,
    replaceColorGreenClassic,
    willChangeVisitor
  ]).process(cssThree, { from: 'a.css' })
  expect(css).toEqual(expectedThree)
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

it('work of three plug-ins in a document; sequence 1', async () => {
  let { css } = await postcss([
    replaceColorGreenClassic,
    willChangeVisitor,
    addPropsVisitor
  ]).process(cssThreeDocument, { from: 'a.css' })
  expect(css).toEqual(expectedThreeDocument)
})

it('work of three plug-ins in a document; sequence 2', async () => {
  let { css } = await postcss([
    addPropsVisitor,
    replaceColorGreenClassic,
    willChangeVisitor
  ]).process(cssThreeDocument, { from: 'a.css' })
  expect(css).toEqual(expectedThreeDocument)
})

const cssThroughProps = '.a{color: yellow;}'
const expectedThroughProps = '.a{color: red;}'

it('change in node values through props; sequence 1', async () => {
  let { css } = await postcss([
    replaceGreenToRed,
    replaceAllButRedToGreen
  ]).process(cssThroughProps, { from: 'a.css' })
  expect(css).toEqual(expectedThroughProps)
})

it('change in node values through props; sequence 2', async () => {
  let { css } = await postcss([
    replaceAllButRedToGreen,
    replaceGreenToRed
  ]).process(cssThroughProps, { from: 'a.css' })
  expect(css).toEqual(expectedThroughProps)
})

it('works visitor plugin postcss-focus', async () => {
  let input = '*:focus { outline: 0; }.button:hover { background: red; }'
  let expected =
    '*:focus { outline: 0; }' +
    '.button:hover, .button:focus { background: red; }'
  let { css } = await postcss([postcssFocus]).process(input, { from: 'a.css' })
  expect(css).toEqual(expected)
})

it('works visitor plugin hidden', async () => {
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
  expect(css).toEqual(expected)
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

it('works visitor plugins postcss-focus and hidden; sequence 1', async () => {
  let { css } = await postcss([hidden, postcssFocus]).process(cssFocusHidden, {
    from: 'a.css'
  })
  expect(css).toEqual(expectedFocusHidden)
})

it('works visitor plugins postcss-focus and hidden; sequence 2', async () => {
  let { css } = await postcss([postcssFocus, hidden]).process(cssFocusHidden, {
    from: 'a.css'
  })
  expect(css).toEqual(expectedFocusHidden)
})

it('works visitor plugin postcss-alias', async () => {
  let input =
    '@alias { fs: font-size; bg: background; }' +
    '.aliased { fs: 16px; bg: white; }'
  let expected = '.aliased { font-size: 16px; background: white; }'
  let { css } = postcss([postcssAlias]).process(input, { from: 'a.css' })
  expect(css).toEqual(expected)
})

it('adds plugin to error', async () => {
  let broken: Plugin = {
    postcssPlugin: 'broken',
    Rule(rule) {
      throw rule.error('test')
    }
  }
  let error
  try {
    postcss([broken]).process('a{}', { from: 'broken.css' }).css
  } catch (e) {
    error = e
  }
  expect(error.message).toEqual(`broken: ${resolve('broken.css')}:1:1: test`)
  expect(error.postcssNode.toString()).toEqual('a{}')
  expect(error.stack).toContain('broken.css:1:1')
})

it('adds plugin to async error', async () => {
  let broken: Plugin = {
    postcssPlugin: 'broken',
    async Rule(rule) {
      await delay(1)
      throw rule.error('test')
    }
  }
  let error
  try {
    await postcss([broken]).process('a{}', { from: 'broken.css' })
  } catch (e) {
    error = e
  }
  expect(error.message).toEqual(`broken: ${resolve('broken.css')}:1:1: test`)
  expect(error.postcssNode.toString()).toEqual('a{}')
  expect(error.stack).toContain('broken.css:1:1')
})

it('adds sync plugin to async error', async () => {
  let broken: Plugin = {
    postcssPlugin: 'broken',
    Rule(rule) {
      throw rule.error('test')
    }
  }
  let error
  try {
    await postcss([broken]).process('a{}', { from: 'broken.css' })
  } catch (e) {
    error = e
  }
  expect(error.message).toEqual(`broken: ${resolve('broken.css')}:1:1: test`)
  expect(error.postcssNode.toString()).toEqual('a{}')
  expect(error.stack).toContain('broken.css:1:1')
})

it('adds node to error', async () => {
  let broken: Plugin = {
    postcssPlugin: 'broken',
    Rule() {
      throw new Error('test')
    }
  }
  let error
  try {
    postcss([broken]).process('a{}', { from: 'broken.css' }).css
  } catch (e) {
    error = e
  }
  expect(error.message).toEqual('test')
  expect(error.postcssNode.toString()).toEqual('a{}')
  expect(error.stack).toContain('broken.css:1:1')
})

it('adds node to async error', async () => {
  let broken: Plugin = {
    postcssPlugin: 'broken',
    async Rule() {
      await delay(1)
      throw new Error('test')
    }
  }
  let error
  try {
    await postcss([broken]).process('a{}', { from: 'broken.css' })
  } catch (e) {
    error = e
  }
  expect(error.message).toEqual('test')
  expect(error.postcssNode.toString()).toEqual('a{}')
  expect(error.stack).toContain('broken.css:1:1')
})

it('shows error on sync call async plugins', () => {
  let asyncPlugin: Plugin = {
    postcssPlugin: 'asyncPlugin',
    async Rule() {}
  }
  let error
  try {
    postcss([asyncPlugin]).process('a{}', { from: 'broken.css' }).css
  } catch (e) {
    error = e
  }
  expect(error.message).toContain('work with async plugins')
})

it('passes helpers', async () => {
  function check(node: AnyNode, helpers: Helpers): void {
    expect(helpers.result.messages).toEqual([])
    expect(typeof helpers.postcss).toEqual('function')
    expect(helpers.comment().type).toEqual('comment')
    expect(new helpers.Comment().type).toEqual('comment')
    expect(helpers.list).toBe(postcss.list)
  }

  let syncPlugin: Plugin = {
    postcssPlugin: 'syncPlugin',
    Once: check,
    Rule: check,
    RuleExit: check,
    OnceExit: check
  }

  let asyncPlugin: Plugin = {
    postcssPlugin: 'syncPlugin',
    async Once(node, helpers) {
      await delay(1)
      check(node, helpers)
    },
    async Rule(node, helpers) {
      await delay(1)
      check(node, helpers)
    },
    async OnceExit(node, helpers) {
      await delay(1)
      check(node, helpers)
    }
  }

  postcss([syncPlugin]).process('a{}', { from: 'a.css' }).css
  await postcss([asyncPlugin]).process('a{}', { from: 'a.css' })
})

it('passes helpers in a document', async () => {
  function check(node: AnyNode, helpers: Helpers): void {
    expect(helpers.result.messages).toEqual([])
    expect(typeof helpers.postcss).toEqual('function')
    expect(helpers.comment().type).toEqual('comment')
    expect(new helpers.Comment().type).toEqual('comment')
    expect(helpers.list).toBe(postcss.list)
  }

  let syncPlugin: Plugin = {
    postcssPlugin: 'syncPlugin',
    Once: check,
    Rule: check,
    RuleExit: check,
    OnceExit: check
  }

  let asyncPlugin: Plugin = {
    postcssPlugin: 'syncPlugin',
    async Once(node, helpers) {
      await delay(1)
      check(node, helpers)
    },
    async Rule(node, helpers) {
      await delay(1)
      check(node, helpers)
    },
    async OnceExit(node, helpers) {
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

it('detects non-changed values', () => {
  let plugin: Plugin = {
    postcssPlugin: 'test',
    Declaration(decl) {
      decl.value = 'red'
    }
  }
  expect(
    postcss([plugin]).process('a{ color: black; background: white; }', {
      from: 'a.css'
    }).css
  ).toEqual('a{ color: red; background: red; }')
})

it('allows runtime listeners', () => {
  let root = false
  let plugin: Plugin = {
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
    },
    Declaration(decl) {
      decl.value = 'red'
    }
  }
  expect(
    postcss([plugin]).process('a{ color: black }', { from: 'a.css' }).css
  ).toEqual('a.css{ color: red }')
  expect(root).toBe(true)
})

it('works correctly with nodes changes', () => {
  let plugin: Plugin = {
    postcssPlugin: 'test',
    Rule(rule) {
      if (!rule.some(i => i.type === 'decl' && i.prop === 'z-index')) {
        rule.prepend({ prop: 'z-index', value: '1' })
      }
    }
  }
  expect(
    postcss([plugin]).process('a{ color: black }', { from: 'a.css' }).css
  ).toEqual('a{ z-index: 1; color: black }')
})

it('throws error on unknown plugin property', () => {
  let plugin: any = {
    postcssPlugin: 'test',
    NO: true
  }
  expect(() => {
    postcss([plugin]).process('').css
  }).toThrow(/Unknown event NO in test\. Try to update PostCSS \(\d/)
})

it('unwraps nodes on inserting', () => {
  let moveNode: Plugin = {
    postcssPlugin: 'moveNode',
    Declaration: {
      color: decl => {
        if (decl.parent?.type !== 'root') {
          decl.root().append(decl)
        }
      }
    }
  }

  let root = postcss([moveNode]).process('a{color:red}').root
  expect((root.last as any).proxyOf).toBe(root.last)
})

let redToGreen: Plugin = {
  postcssPlugin: 'redToGreen',
  Declaration: {
    color: decl => {
      if (decl.value === 'red') {
        decl.value = 'green'
      }
    }
  }
}

let greenToBlue: Plugin = {
  postcssPlugin: 'greenToBlue',
  Declaration(decl) {
    if (decl.value === 'green') {
      decl.value = 'blue'
    }
  }
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
        'define-mixin': atRule => {
          if (atRule.first) mixin = atRule.first
          atRule.remove()
        },
        'apply-mixin': atRule => {
          if (mixin) atRule.replaceWith(mixin)
        }
      }
    }
  }
}

let insertFirst: Plugin = {
  postcssPlugin: 'insertFirst',
  AtRule: {
    'insert-first': atRule => {
      let first = atRule.root().first
      if (first) atRule.replaceWith(first)
    }
  }
}

for (let type of ['sync', 'async']) {
  it(`walks ${type} through tree`, async () => {
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
    if (type === 'sync') {
      processor.css
    } else {
      await processor
    }
    expect(addIndex(visits)).toEqual(
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

  it(`walks ${type} through tree in a document`, async () => {
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
    if (type === 'sync') {
      processor.css
    } else {
      await processor
    }

    expect(addIndex(visits)).toEqual(
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

  it(`walks ${type} during transformations`, async () => {
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
    if (type === 'sync') {
      output = result.css
    } else {
      output = (await result).css
    }
    expect(output).toEqual(
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
    expect(addIndex(visits)).toEqual(
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

  it(`walks ${type} during transformations in a document`, async () => {
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
    if (type === 'sync') {
      output = result.css
    } else {
      output = (await result).css
    }

    expect(output).toEqual(
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
    expect(addIndex(visits)).toEqual(
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

  it(`has ${type} property and at-rule name filters`, async () => {
    let filteredDecls: string[] = []
    let allDecls: string[] = []
    let filteredAtRules: string[] = []
    let allAtRules: string[] = []
    let allExits: string[] = []
    let filteredExits: string[] = []

    let scanner: Plugin = {
      postcssPlugin: 'test',
      Declaration: {
        'color': decl => {
          filteredDecls.push(decl.prop)
        },
        '*': decl => {
          allDecls.push(decl.prop)
        }
      },
      DeclarationExit: {
        'color': decl => {
          filteredExits.push(decl.prop)
        },
        '*': decl => {
          allExits.push(decl.prop)
        }
      },
      AtRule: {
        'media': atRule => {
          filteredAtRules.push(atRule.name)
        },
        '*': atRule => {
          allAtRules.push(atRule.name)
        }
      }
    }

    let result = postcss([scanner]).process(
      `@charset "UTF-8"; @media (screen) { COLOR: black; z-index: 1 }`,
      { from: 'a.css' }
    )
    if (type === 'sync') {
      result.css
    } else {
      await result
    }

    expect(filteredDecls).toEqual(['COLOR'])
    expect(allDecls).toEqual(['COLOR', 'z-index'])
    expect(filteredExits).toEqual(['COLOR'])
    expect(allExits).toEqual(['COLOR', 'z-index'])
    expect(filteredAtRules).toEqual(['media'])
    expect(allAtRules).toEqual(['charset', 'media'])
  })

  it(`has ${type} property and at-rule name filters in a document`, async () => {
    let filteredDecls: string[] = []
    let allDecls: string[] = []
    let filteredAtRules: string[] = []
    let allAtRules: string[] = []
    let allExits: string[] = []
    let filteredExits: string[] = []

    let scanner: Plugin = {
      postcssPlugin: 'test',
      Declaration: {
        'color': decl => {
          filteredDecls.push(decl.prop)
        },
        '*': decl => {
          allDecls.push(decl.prop)
        }
      },
      DeclarationExit: {
        'color': decl => {
          filteredExits.push(decl.prop)
        },
        '*': decl => {
          allExits.push(decl.prop)
        }
      },
      AtRule: {
        'media': atRule => {
          filteredAtRules.push(atRule.name)
        },
        '*': atRule => {
          allAtRules.push(atRule.name)
        }
      }
    }

    let document = postcss.document({
      nodes: [
        postcss.parse(
          `@charset "UTF-8"; @media (screen) { COLOR: black; z-index: 1 }`
        )
      ]
    })

    let result = postcss([scanner]).process(document, { from: 'a.css' })
    if (type === 'sync') {
      result.css
    } else {
      await result
    }

    expect(filteredDecls).toEqual(['COLOR'])
    expect(allDecls).toEqual(['COLOR', 'z-index'])
    expect(filteredExits).toEqual(['COLOR'])
    expect(allExits).toEqual(['COLOR', 'z-index'])
    expect(filteredAtRules).toEqual(['media'])
    expect(allAtRules).toEqual(['charset', 'media'])
  })

  it(`has ${type} OnceExit listener`, async () => {
    let rootExit = 0
    let OnceExit = 0

    let plugin: Plugin = {
      postcssPlugin: 'test',
      Rule(rule) {
        rule.remove()
      },
      RootExit() {
        rootExit += 1
      },
      OnceExit() {
        OnceExit += 1
      }
    }

    let result = postcss([plugin]).process('a{}', { from: 'a.css' })

    if (type === 'sync') {
      result.css
    } else {
      await result
    }

    expect(rootExit).toBe(2)
    expect(OnceExit).toBe(1)
  })

  it(`has ${type} OnceExit listener in a document with one root`, async () => {
    let RootExit = 0
    let OnceExit = 0
    let DocumentExit = 0

    let plugin: Plugin = {
      postcssPlugin: 'test',
      Rule(rule) {
        rule.remove()
      },
      RootExit() {
        RootExit += 1
      },
      DocumentExit() {
        DocumentExit += 1
      },
      OnceExit() {
        OnceExit += 1
      }
    }

    let document = postcss.document({
      nodes: [postcss.parse('a{}')]
    })

    let result = postcss([plugin]).process(document, { from: 'a.css' })

    if (type === 'sync') {
      result.css
    } else {
      await result
    }

    expect(RootExit).toBe(2)
    expect(DocumentExit).toBe(2)
    expect(OnceExit).toBe(1)
  })

  it(`has ${type} OnceExit listener in a document with two roots`, async () => {
    let RootExit = 0
    let OnceExit = 0
    let DocumentExit = 0

    let plugin: Plugin = {
      postcssPlugin: 'test',
      Rule(rule) {
        rule.remove()
      },
      RootExit() {
        RootExit += 1
      },
      DocumentExit() {
        DocumentExit += 1
      },
      OnceExit() {
        OnceExit += 1
      }
    }

    let document = postcss.document({
      nodes: [postcss.parse('a{}'), postcss.parse('b{}')]
    })

    let result = postcss([plugin]).process(document, { from: 'a.css' })

    if (type === 'sync') {
      result.css
    } else {
      await result
    }

    expect(RootExit).toBe(4)
    expect(DocumentExit).toBe(2)
    expect(OnceExit).toBe(2) // 2 roots === 2 OnceExit
  })
}

it('throws error from async OnceExit', async () => {
  let plugin: Plugin = {
    postcssPlugin: 'test',
    OnceExit() {
      throw new Error('test Exit error')
    }
  }

  let result = postcss([plugin]).process('a{ color: black }', {
    from: 'a.css'
  })

  let error
  try {
    await result
  } catch (e) {
    error = e
  }

  expect(error.message).toEqual('test Exit error')
})

it('rescan Root in another processor', () => {
  let [visits, visitor] = buildVisitor()
  let root = postcss([visitor]).process('a{z-index:1}', { from: 'a.css' }).root

  visits.splice(0, visits.length)
  postcss([visitor]).process(root, { from: 'a.css' }).root

  expect(visits).toEqual([
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

it('rescan Root in another processor in a document', () => {
  let [visits, visitor] = buildVisitor()
  let root = postcss([visitor]).process('a{z-index:1}', { from: 'a.css' }).root
  let document = postcss.document({ nodes: [root] })

  visits.splice(0, visits.length)
  postcss([visitor]).process(document, { from: 'a.css' }).root

  expect(visits).toEqual([
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

it('marks cleaned nodes as dirty on moving', () => {
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

  expect(visits).toEqual([
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

it('marks cleaned nodes as dirty on moving in a document', () => {
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

  expect(visits).toEqual([
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
