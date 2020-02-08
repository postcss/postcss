let postcss = require('../lib/postcss')

function hasAlready (parent, selector) {
  return parent.nodes.some(i => {
    return i.type === 'rule' && i.selectors.indexOf(selector) !== -1
  })
}

let replaceColorGreenClassic = postcss.plugin('replace-color', () => root => {
  root.walkDecls('color', decl => {
    decl.value = 'green'
  })
})

let willChangeVisitor = postcss.plugin('will-change', () => root => {
  root.on('decl', node => {
    if (node.prop !== 'will-change') return

    let already = node.parent.some(i => {
      return i.type === 'decl' && i.prop === 'backface-visibility'
    })
    if (already) return

    node.cloneBefore({ prop: 'backface-visibility', value: 'hidden' })
  })
})

let addPropsVisitor = postcss.plugin('add-props', () => root => {
  root.on('decl', node => {
    if (node.prop !== 'will-change') return

    node.root().walkDecls('color', decl => {
      let already = decl.parent.some(i => {
        return i.type === 'decl' && i.prop === 'will-change'
      })
      if (already) return

      decl.cloneBefore({ prop: 'will-change', value: 'transform' })
    })
  })
})

let replaceAllButRedToGreen = postcss.plugin('not-red-to-green', () => root => {
  root.on('decl', node => {
    if (node.prop !== 'color') return
    if (node.prop === 'color' && node.value === 'red') return

    node.prop = 'color'
    node.value = 'green'
  })
})

let replaceGreenToRed = postcss.plugin('replace-green-to-red', () => root => {
  root.on('decl', node => {
    if (node.prop !== 'color') return
    if (node.prop === 'color' && node.value === 'green') {
      node.prop = 'color'
      node.value = 'red'
    }
  })
})

let postcssFocus = postcss.plugin('postcss-focus', () => root => {
  root.on('rule', rule => {
    if (rule.selector.indexOf(':hover') !== -1) {
      let focuses = []
      rule.selectors.forEach(selector => {
        if (selector.indexOf(':hover') !== -1) {
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
  })
})

let hidden = postcss.plugin('hidden', () => root => {
  root.on('decl', decl => {
    if (decl.prop !== 'display') return

    let value = decl.value

    if (value.indexOf('disappear') !== -1) {
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

    if (value.indexOf('hidden') !== -1) {
      let ruleSelectors = decl.parent.selectors.map(i => {
        return `${ i }.focusable:active,${ i }.focusable:focus`
      })

      let newRule = decl.parent
        .cloneAfter({ selectors: ruleSelectors })
        .removeAll()
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

    if (value.indexOf('invisible') !== -1) {
      decl.cloneBefore({ prop: 'visibility', value: 'hidden' })
      decl.remove()
    }
  })
})

let postcssAlias = postcss.plugin('postcss-alias', () => root => {
  let aliases = {}
  root.walkAtRules('alias', rule => {
    rule.walkDecls(decl => {
      aliases[decl.prop] = decl.value
    })
    rule.remove()
  })

  root.on('decl', decl => {
    let value = aliases[decl.prop]
    if (value !== undefined) {
      decl.replaceWith({
        prop: value,
        value: decl.value,
        important: decl.important
      })
    }
  })
})

it('works classic plugin replace-color', async () => {
  let { css } = await postcss([replaceColorGreenClassic]).process(
    '.a{ color: red; } ' +
    '.b{ will-change: transform; }',
    { from: 'a.css' }
  )
  expect(css).toEqual(
    '.a{ color: green; } ' +
    '.b{ will-change: transform; }'
  )
})

it('works visitor plugin will-change', async () => {
  let { css } = await postcss([willChangeVisitor]).process(
    '.foo { will-change: transform; }', { from: 'a.css' }
  )
  expect(css).toEqual(
    '.foo { backface-visibility: hidden; will-change: transform; }'
  )
})

it('works visitor plugin add-prop', async () => {
  let { css } = await postcss([addPropsVisitor]).process(
    '.a{ color: red; } .b{ will-change: transform; }', { from: 'a.css' }
  )
  expect(css).toEqual(
    '.a{ will-change: transform; color: red; } ' +
    '.b{ will-change: transform; }'
  )
})

const cssThree =
  '.a{ color: red; } ' +
  '.b{ will-change: transform; }'

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
  let input =
    '*:focus { outline: 0; }' +
    '.button:hover { background: red; }'
  let expected =
    '*:focus { outline: 0; }' +
    '.button:hover, .button:focus { background: red; }'
  let { css } = await postcss([postcssFocus]).process(input, { from: 'a.css' })
  expect(css).toEqual(expected)
})

it('works visitor plugin hidden', async () => {
  let input =
    'h2{' +
    'display: hidden;' +
    '}'

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
  let { css } = await postcss([hidden, postcssFocus]).process(
    cssFocusHidden, { from: 'a.css' }
  )
  expect(css).toEqual(expectedFocusHidden)
})

it('works visitor plugins postcss-focus and hidden; sequence 2', async () => {
  let { css } = await postcss([postcssFocus, hidden]).process(
    cssFocusHidden, { from: 'a.css' }
  )
  expect(css).toEqual(expectedFocusHidden)
})

it('works visitor plugin postcss-alias', async () => {
  let input =
    '@alias { fs: font-size; bg: background; }' +
    '.aliased { fs: 16px; bg: white; }'
  let expected = '.aliased { font-size: 16px; background: white; }'
  let { css } = await postcss([postcssAlias]).process(input, { from: 'a.css' })
  expect(css).toEqual(expected)
})
