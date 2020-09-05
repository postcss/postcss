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
import { isClean } from '../lib/symbols.js'

function hasAlready (parent: Container | undefined, selector: string) {
  if (typeof parent === 'undefined') return false
  return parent.nodes.some(i => {
    return i.type === 'rule' && i.selectors.includes(selector)
  })
}

let replaceColorGreenClassic: Plugin = {
  postcssPlugin: 'replace-color',
  Root (root) {
    root.walkDecls('color', decl => {
      decl.value = 'green'
    })
  }
}

let willChangeVisitor: Plugin = {
  postcssPlugin: 'will-change',
  Declaration (node) {
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
  Declaration (node) {
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
  Declaration (node) {
    if (node.prop === 'color' && node.value !== 'red') {
      node.value = 'green'
    }
  }
}

let replaceGreenToRed: Plugin = {
  postcssPlugin: 'replace-green-to-red',
  Declaration (node) {
    if (node.prop === 'color' && node.value === 'green') {
      node.value = 'red'
    }
  }
}

let replacePrintToMobile: Plugin = {
  postcssPlugin: 'replace-to-mobile',
  AtRule (node) {
    if (node.params === '(print)') {
      node.params = '(mobile)'
    }
  }
}

let replaceScreenToPrint: Plugin = {
  postcssPlugin: 'replace-to-print',
  AtRule (node) {
    if (node.params === '(screen)') {
      node.params = '(print)'
    }
  }
}

let postcssFocus: Plugin = {
  postcssPlugin: 'postcss-focus',
  Rule (rule) {
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
  Declaration (decl) {
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

function createPlugin (creator: () => Plugin): PluginCreator<void> {
  let result = creator as PluginCreator<void>
  result.postcss = true
  return result
}

let postcssAlias = createPlugin(() => {
  let aliases: any = {}
  return {
    postcssPlugin: 'postcss-alias',
    Root (root) {
      root.walkAtRules('alias', rule => {
        rule.walkDecls(decl => {
          aliases[decl.prop] = decl.value
        })
        rule.remove()
      })
    },
    Declaration (decl) {
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
  let { css } = postcss([
    willChangeVisitor
  ]).process('.foo { will-change: transform; }', { from: 'a.css' })
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

it('works with at-rule params', () => {
  let { css } = postcss([
    replacePrintToMobile,
    replaceScreenToPrint
  ]).process('@media (screen) {}', { from: 'a.css' })
  expect(css).toEqual('@media (mobile) {}')
})

it('wraps node to proxies', () => {
  let proxy: any
  let root: Root | undefined
  postcss({
    postcssPlugin: 'proxyCatcher',
    Root (node) {
      root = node
    },
    Rule (node) {
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
    Rule (rule) {
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
    async Rule (rule) {
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
    Rule (rule) {
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
    Rule () {
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
    async Rule () {
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
    async Rule () {}
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
  function check (node: AnyNode, helpers: Helpers) {
    expect(helpers.result.messages).toEqual([])
    expect(typeof helpers.postcss).toEqual('function')
    expect(helpers.comment().type).toEqual('comment')
    expect(new helpers.Comment().type).toEqual('comment')
    expect(helpers.list).toBe(postcss.list)
  }

  let syncPlugin: Plugin = {
    postcssPlugin: 'syncPlugin',
    Root: check,
    Rule: check,
    RuleExit: check,
    RootExit: check
  }

  let asyncPlugin: Plugin = {
    postcssPlugin: 'syncPlugin',
    async Root (node, helpers) {
      await delay(1)
      check(node, helpers)
    },
    async Rule (node, helpers) {
      await delay(1)
      check(node, helpers)
    },
    async RootExit (node, helpers) {
      await delay(1)
      check(node, helpers)
    }
  }

  postcss([syncPlugin]).process('a{}', { from: 'a.css' }).css
  await postcss([asyncPlugin]).process('a{}', { from: 'a.css' })
})

it('detects non-changed values', () => {
  let plugin: Plugin = {
    postcssPlugin: 'test',
    Declaration (decl) {
      decl.value = 'red'
    }
  }
  expect(
    postcss([plugin]).process('a{ color: black; background: white; }', {
      from: 'a.css'
    }).css
  ).toEqual('a{ color: red; background: red; }')
})

it('allow runtime listeners', () => {
  let root = false
  let plugin: Plugin = {
    postcssPlugin: 'test',
    prepare (result) {
      return {
        Root () {
          root = true
        },
        Rule (rule) {
          rule.selector = basename(result.opts.from ?? '')
        }
      }
    },
    Declaration (decl) {
      decl.value = 'red'
    }
  }
  expect(
    postcss([plugin]).process('a{ color: black }', { from: 'a.css' }).css
  ).toEqual('a.css{ color: red }')
  expect(root).toBe(true)
})

it('throws on Promise in sync RootExit', async () => {
  let plugin: Plugin = {
    postcssPlugin: 'test',
    async RootExit () {
      await delay(10)
    }
  }

  expect(() => {
    postcss([plugin]).process('a{ color: black }', { from: 'a.css' }).css
  }).toThrow(/work with async plugins/)
})

it('throws error from sync RootExit', async () => {
  let plugin: Plugin = {
    postcssPlugin: 'test',
    RootExit () {
      throw new Error('test rootExit error')
    }
  }

  expect(() => {
    postcss([plugin]).process('a{ color: black }', { from: 'a.css' }).css
  }).toThrow(/test rootExit error/)
})

it('throws error from async RootExit', async () => {
  let plugin: Plugin = {
    postcssPlugin: 'test',
    async RootExit () {
      throw new Error('test rootExit error')
    }
  }

  let error
  try {
    await postcss([plugin]).process('a{ color: black }', { from: 'a.css' })
  } catch (e) {
    error = e
  }

  expect(error.message).toEqual('test rootExit error')
})

let visits: [number, string, string][] = []
let visitor: Plugin = {
  postcssPlugin: 'visitor',
  Root (i) {
    visits.push([visits.length, 'Root', `${i.nodes.length}`])
  },
  RootExit (i) {
    visits.push([visits.length, 'RootExit', `${i.nodes.length}`])
  },
  AtRule (i) {
    visits.push([visits.length, 'AtRule', i.name])
  },
  AtRuleExit (i) {
    visits.push([visits.length, 'AtRuleExit', i.name])
  },
  Rule (i) {
    visits.push([visits.length, 'Rule', i.selector])
  },
  RuleExit (i) {
    visits.push([visits.length, 'RuleExit', i.selector])
  },
  Declaration (i) {
    visits.push([visits.length, 'Declaration', i.prop + ': ' + i.value])
  },
  DeclarationExit (i) {
    visits.push([visits.length, 'DeclarationExit', i.prop + ': ' + i.value])
  },
  Comment (i) {
    visits.push([visits.length, 'Comment', i.text])
  },
  CommentExit (i) {
    visits.push([visits.length, 'CommentExit', i.text])
  }
}

const redToGreen: Plugin = {
  postcssPlugin: 'redToGreen',
  Declaration: {
    color: decl => {
      if (decl.value === 'red') {
        decl.value = 'green'
      }
    }
  }
}

const greenToBlue: Plugin = {
  postcssPlugin: 'greenToBlue',
  Declaration (decl) {
    if (decl.value === 'green') {
      decl.value = 'blue'
    }
  }
}

const fooToBar: Plugin = {
  postcssPlugin: 'fooToBar',
  Rule (rule) {
    if (rule.selector === '.foo') {
      rule.selectors = ['.bar']
    }
  }
}

const mixins: Plugin = {
  postcssPlugin: 'mixin',
  prepare () {
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

const insertFirst: Plugin = {
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
    visits = []
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
    expect(visits).toEqual([
      [0, 'Root', '1'],
      [1, 'AtRule', 'media'],
      [2, 'Rule', 'body'],
      [3, 'Comment', 'comment'],
      [4, 'CommentExit', 'comment'],
      [5, 'Declaration', 'background: white'],
      [6, 'DeclarationExit', 'background: white'],
      [7, 'Declaration', 'padding: 10px'],
      [8, 'DeclarationExit', 'padding: 10px'],
      [9, 'RuleExit', 'body'],
      [10, 'Rule', 'a'],
      [11, 'Declaration', 'color: blue'],
      [12, 'DeclarationExit', 'color: blue'],
      [13, 'RuleExit', 'a'],
      [14, 'AtRuleExit', 'media'],
      [15, 'RootExit', '1']
    ])
  })

  it(`walks ${type} during transformations`, async () => {
    visits = []
    let processor = postcss([
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
      output = processor.css
    } else {
      let result = await processor
      output = result.css
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
    expect(visits).toEqual([
      [0, 'Root', '6'],
      [1, 'Rule', '.first'],
      [2, 'Declaration', 'color: red'],
      [3, 'DeclarationExit', 'color: green'],
      [4, 'RuleExit', '.first'],
      [5, 'AtRule', 'define-mixin'],
      [6, 'Rule', 'a'],
      [7, 'Declaration', 'color: red'],
      [8, 'DeclarationExit', 'color: green'],
      [9, 'RuleExit', 'a'],
      [10, 'AtRule', 'media'],
      [11, 'AtRule', 'insert-first'],
      [12, 'AtRuleExit', 'media'],
      [13, 'Rule', '.foo'],
      [14, 'Declaration', 'background: red'],
      [15, 'DeclarationExit', 'background: red'],
      [16, 'RuleExit', '.bar'],
      [17, 'AtRule', 'apply-mixin'],
      [18, 'Declaration', 'color: green'],
      [19, 'DeclarationExit', 'color: blue'],
      [20, 'AtRule', 'media'],
      [21, 'Rule', '.first'],
      [22, 'Declaration', 'color: green'],
      [23, 'DeclarationExit', 'color: blue'],
      [24, 'RuleExit', '.first'],
      [25, 'AtRuleExit', 'media'],
      [26, 'Rule', 'b'],
      [27, 'Declaration', 'color: red'],
      [28, 'DeclarationExit', 'color: green'],
      [29, 'RuleExit', 'b'],
      [30, 'Declaration', 'color: blue'],
      [31, 'DeclarationExit', 'color: blue'],
      [32, 'Declaration', 'color: blue'],
      [33, 'DeclarationExit', 'color: blue'],
      [34, 'Declaration', 'color: green'],
      [35, 'DeclarationExit', 'color: blue'],
      [36, 'Declaration', 'color: blue'],
      [37, 'DeclarationExit', 'color: blue'],
      [38, 'RootExit', '4']
    ])
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

    let processor = postcss([
      scanner
    ]).process(
      `@charset "UTF-8"; @media (screen) { COLOR: black; z-index: 1 }`,
      { from: 'a.css' }
    )
    if (type === 'sync') {
      processor.css
    } else {
      await processor
    }

    expect(filteredDecls).toEqual(['COLOR'])
    expect(allDecls).toEqual(['COLOR', 'z-index'])
    expect(filteredExits).toEqual(['COLOR'])
    expect(allExits).toEqual(['COLOR', 'z-index'])
    expect(filteredAtRules).toEqual(['media'])
    expect(allAtRules).toEqual(['charset', 'media'])
  })

  it(`has ${type} Exit listener`, async () => {
    let exit = 0

    let plugin: Plugin = {
      postcssPlugin: 'test',
      Rule (rule) {
        rule.remove()
      },
      RootExit (root, { result }) {
        expect(basename(result.opts.from ?? '')).toEqual('a.css')
        exit += 1
      }
    }

    let processor = postcss([plugin]).process('a{}', { from: 'a.css' })

    if (type === 'sync') {
      processor.css
    } else {
      await processor
    }

    expect(exit).toBe(1)
  })
}
