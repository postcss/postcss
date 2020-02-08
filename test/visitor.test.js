let postcss = require('../lib/postcss')

let replaceColorGreenClassicPlugin = postcss.plugin('replace-color', () => {
  return function (css) {
    css.walkDecls('color', decl => {
      decl.value = 'green'
    })
  }
})

let willChangeVisitorPlugin = postcss.plugin('will-change', () => {
  return function (css) {
    css.on('decl', node => {
      if (node.prop !== 'will-change') {
        return
      }

      let already = node.parent.some(i => {
        return i.type === 'decl' && i.prop === 'backface-visibility'
      })

      if (already) {
        return
      }

      node.cloneBefore({
        prop: 'backface-visibility',
        value: 'hidden'
      })
    })
  }
})

let addPropsVisitorPlugin = postcss.plugin('add-props', () => {
  return function (css) {
    css.on('decl', node => {
      if (node.prop !== 'will-change') {
        return
      }
      let root = node.root()

      root.walkDecls('color', decl => {
        let already = decl.parent.some(i => {
          return i.type === 'decl' && i.prop === 'will-change'
        })

        if (already) {
          return
        }

        decl.cloneBefore({
          prop: 'will-change',
          value: 'transform'
        })
      })
    })
  }
})

let replaceAllButRedToGreen = postcss.plugin(
  'replace-all-but-red-to-green',
  () => {
    return function (css) {
      css.on('decl', node => {
        if (node.prop !== 'color') {
          return
        }
        if (node.prop === 'color' && node.value === 'red') {
          return
        }

        node.prop = 'color'
        node.value = 'green'
      })
    }
  })

let replaceGreenToRed = postcss.plugin('replace-green-to-red', () => {
  return function (css) {
    css.on('decl', node => {
      if (node.prop !== 'color') {
        return
      }
      if (node.prop === 'color' && node.value === 'green') {
        node.prop = 'color'
        node.value = 'red'
      }
    })
  }
})

function hasAlready (parent, selector) {
  return parent.nodes.some(i => {
    return i.type === 'rule' && i.selectors.indexOf(selector) !== -1
  })
}

let postcssFocus = postcss.plugin('postcss-focus', () => {
  return function (css) {
    css.on('rule', rule => {
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
  }
})

let hidden = postcss.plugin('hidden', options => {
  return function (css) {
    options = options || {}
    css.on('decl', decl => {
      if (decl.prop !== 'display') { return }

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
        let origRule = decl.parent
        let ruleSelectors = origRule.selectors
        let newRule

        ruleSelectors = ruleSelectors.map(ruleSelector => (
          ruleSelector +
          '.focusable:active,' +
          ruleSelector +
          '.focusable:focus'
        ))

        newRule = origRule.cloneAfter({
          selectors: ruleSelectors
        }).removeAll()

        newRule.append('display: table; position: static; clear: both;')

        decl.cloneBefore({
          prop: 'position',
          value: 'absolute'
        })
        decl.cloneBefore({
          prop: 'width',
          value: '1px'
        })
        decl.cloneBefore({
          prop: 'height',
          value: '1px'
        })
        decl.cloneBefore({
          prop: 'margin',
          value: '-1px'
        })
        decl.cloneBefore({
          prop: 'padding',
          value: '0'
        })
        decl.cloneBefore({
          prop: 'border',
          value: '0'
        })
        decl.cloneBefore({
          prop: 'overflow',
          value: 'hidden'
        })
        decl.cloneBefore({
          prop: 'clip',
          value: 'rect(0 0 0 0)'
        })

        decl.remove()
      }

      if (value.indexOf('invisible') !== -1) {
        // Insert invisible css
        decl.cloneBefore({
          prop: 'visibility',
          value: 'hidden'
        })

        decl.remove()
      }
    })
  }
})

let postcssAlias = postcss.plugin('postcss-alias', () => {
  return function (css) {
    let aliases = {}
    css.walkAtRules('alias', rule => {
      rule.walkDecls(decl => {
        aliases[decl.prop] = decl.value
      })
      rule.remove()
    })

    css.on('decl', decl => {
      let value = aliases[decl.prop]
      if (value !== undefined) {
        decl.replaceWith({
          prop: value,
          value: decl.value,
          important: decl.important
        })
      }
    })
  }
})

it('works classic plugin replace-color', () => {
  return postcss([replaceColorGreenClassicPlugin]).process(
    '.a{ color: red; } ' +
    '.b{ will-change: transform; }', { from: undefined })
    .then(result => {
      expect(result.css).toEqual(
        '.a{ color: green; } ' +
        '.b{ will-change: transform; }'
      )
    })
})

it('works visitor plugin will-change', () => {
  return postcss([willChangeVisitorPlugin])
    .process(
      '.foo { will-change: transform; }', { from: undefined })
    .then(result => {
      expect(result.css).toEqual(
        '.foo { backface-visibility: hidden; will-change: transform; }'
      )
    })
})

it('works visitor plugin add-prop', () => {
  return postcss([addPropsVisitorPlugin]).process(
    '.a{ color: red; } ' +
    '.b{ will-change: transform; }', { from: undefined })
    .then(result => {
      expect(result.css).toEqual(
        '.a{ will-change: transform; color: red; } ' +
        '.b{ will-change: transform; }'
      )
    })
})

const cssThreePlugins =
  '.a{ color: red; } ' +
  '.b{ will-change: transform; }'

const expectedThreePlugins =
  '.a{ ' +
    'backface-visibility: hidden; ' +
    'will-change: transform; ' +
    'color: green; ' +
  '} ' +
  '.b{ backface-visibility: hidden; will-change: transform; }'

it('work of three plug-ins; sequence 1', () => {
  return postcss([
    replaceColorGreenClassicPlugin,
    willChangeVisitorPlugin,
    addPropsVisitorPlugin
  ]).process(cssThreePlugins, { from: undefined })
    .then(result => { expect(result.css).toEqual(expectedThreePlugins) })
})

it('work of three plug-ins; sequence 2', () => {
  return postcss([
    addPropsVisitorPlugin,
    replaceColorGreenClassicPlugin,
    willChangeVisitorPlugin
  ]).process(cssThreePlugins, { from: undefined })
    .then(result => { expect(result.css).toEqual(expectedThreePlugins) })
})

const cssThroughProps = '.a{color: yellow;}'
const expectedThroughProps = '.a{color: red;}'

it('change in node values through props; sequence 1', () => {
  return postcss([
    replaceGreenToRed,
    replaceAllButRedToGreen
  ]).process(cssThroughProps, { from: undefined })
    .then(result => { expect(result.css).toEqual(expectedThroughProps) })
})

it('change in node values through props; sequence 2', () => {
  return postcss([
    replaceAllButRedToGreen,
    replaceGreenToRed
  ]).process(cssThroughProps, { from: undefined })
    .then(result => { expect(result.css).toEqual(expectedThroughProps) })
})

it('works visitor plugin postcss-focus', () => {
  let css =
    '*:focus { outline: 0; }' +
    '.button:hover { background: red; }'

  let expected =
    '*:focus { outline: 0; }' +
    '.button:hover, .button:focus { background: red; }'

  return postcss([
    postcssFocus
  ]).process(css, { from: undefined })
    .then(result => {
      expect(result.css).toEqual(expected)
    })
})

it('works visitor plugin hidden', () => {
  let css =
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

  return postcss([
    hidden
  ]).process(css, { from: undefined })
    .then(result => {
      expect(result.css).toEqual(expected)
    })
})

let cssPostcssfocusHidden =
  '*:focus { outline: 0; }' +
  '.button:hover { background: red; }' +
  'h2:hover{' +
    'display: hidden;' +
  '}'

let expectedPostcssfocusHidden =
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

it('works visitor plugins postcss-focus and hidden; sequence 1', () => {
  return postcss([
    hidden,
    postcssFocus
  ]).process(cssPostcssfocusHidden, { from: undefined })
    .then(result => {
      expect(result.css).toEqual(expectedPostcssfocusHidden)
    })
})

it('works visitor plugins postcss-focus and hidden; sequence 2', () => {
  return postcss([
    postcssFocus,
    hidden
  ]).process(cssPostcssfocusHidden, { from: undefined })
    .then(result => {
      expect(result.css).toEqual(expectedPostcssfocusHidden)
    })
})

it('works visitor plugin postcss-alias', () => {
  let css =
    '@alias { fs: font-size; bg: background; }' +
    '.aliased { fs: 16px; bg: white; }'

  let expected = '.aliased { font-size: 16px; background: white; }'

  return postcss([
    postcssAlias
  ]).process(css, { from: undefined })
    .then(result => {
      expect(result.css).toEqual(expected)
    })
})
