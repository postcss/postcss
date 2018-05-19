const Processor = require('../lib/processor')
const postcss = require('../lib/postcss')

it('creates plugins list', () => {
  const processor = postcss()
  expect(processor instanceof Processor).toBeTruthy()
  expect(processor.plugins).toEqual([])
})

it('saves plugins list', () => {
  const a = () => 1
  const b = () => 2
  expect(postcss(a, b).plugins).toEqual([a, b])
})

it('saves plugins list as array', () => {
  const a = () => 1
  const b = () => 2
  expect(postcss([a, b]).plugins).toEqual([a, b])
})

it('takes plugin from other processor', () => {
  const a = () => 1
  const b = () => 2
  const c = () => 3
  const other = postcss([a, b])
  expect(postcss([other, c]).plugins).toEqual([a, b, c])
})

it('supports injecting additional processors at runtime', () => {
  const plugin1 = postcss.plugin('one', () => {
    return css => {
      css.walkDecls(decl => {
        decl.value = 'world'
      })
    }
  })
  const plugin2 = postcss.plugin('two', () => {
    return (css, result) => {
      result.processor.use(plugin1())
    }
  })

  return postcss([plugin2]).process('a{hello: bob}', { from: undefined })
    .then(result => {
      expect(result.css).toEqual('a{hello: world}')
    })
})

it('creates plugin', () => {
  const plugin = postcss.plugin('test', filter => {
    return root => {
      root.walkDecls(filter || 'two', i => i.remove())
    }
  })

  const func1 = postcss(plugin).plugins[0]
  expect(func1.postcssPlugin).toEqual('test')
  expect(func1.postcssVersion).toMatch(/\d+.\d+.\d+/)

  const func2 = postcss(plugin()).plugins[0]
  expect(func2.postcssPlugin).toEqual(func1.postcssPlugin)
  expect(func2.postcssVersion).toEqual(func1.postcssVersion)

  const result1 = postcss(plugin('one')).process('a{ one: 1; two: 2 }')
  expect(result1.css).toEqual('a{ two: 2 }')

  const result2 = postcss(plugin).process('a{ one: 1; two: 2 }')
  expect(result2.css).toEqual('a{ one: 1 }')
})

it('does not call plugin constructor', () => {
  let calls = 0
  const plugin = postcss.plugin('test', () => {
    calls += 1
    return () => { }
  })
  expect(calls).toBe(0)

  postcss(plugin).process('a{}')
  expect(calls).toBe(1)

  postcss(plugin()).process('a{}')
  expect(calls).toBe(2)
})

it('creates a shortcut to process css', () => {
  const plugin = postcss.plugin('test', str => {
    return root => {
      root.walkDecls(i => {
        i.value = str || 'bar'
      })
    }
  })

  const result1 = plugin.process('a{value:foo}')
  expect(result1.css).toEqual('a{value:bar}')

  const result2 = plugin.process('a{value:foo}', { }, 'baz')
  expect(result2.css).toEqual('a{value:baz}')

  return plugin.process('a{value:foo}', { from: 'a' }, 'baz').then(result => {
    expect(result.opts).toEqual({ from: 'a' })
    expect(result.css).toEqual('a{value:baz}')
  })
})

it('contains parser', () => {
  expect(postcss.parse('').type).toEqual('root')
})

it('contains stringifier', () => {
  expect(typeof postcss.stringify).toEqual('function')
})

it('allows to build own CSS', () => {
  const root = postcss.root({ raws: { after: '\n' } })
  const comment = postcss.comment({ text: 'Example' })
  const media = postcss.atRule({ name: 'media', params: 'screen' })
  const rule = postcss.rule({ selector: 'a' })
  const decl = postcss.decl({ prop: 'color', value: 'black' })

  root.append(comment)
  rule.append(decl)
  media.append(rule)
  root.append(media)

  expect(root.toString()).toEqual('/* Example */\n' +
                                  '@media screen {\n' +
                                  '    a {\n' +
                                  '        color: black\n' +
                                  '    }\n' +
                                  '}\n')
})

it('contains vendor module', () => {
  expect(postcss.vendor.prefix('-moz-tab')).toEqual('-moz-')
})

it('contains list module', () => {
  expect(postcss.list.space('a b')).toEqual(['a', 'b'])
})

it('works with null', () => {
  expect(() => {
    postcss().process(null).css
  }).toThrowError(/PostCSS received null instead of CSS string/)
})
