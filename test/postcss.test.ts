import postcss, { Root, PluginCreator } from '../lib/postcss.js'
import Processor from '../lib/processor.js'

afterEach(() => {
  jest.resetAllMocks()
})

it('creates plugins list', () => {
  let processor = postcss()
  expect(processor instanceof Processor).toBe(true)
  expect(processor.plugins).toEqual([])
})

it('saves plugins list', () => {
  let a = (): void => {}
  let b = (): void => {}
  expect(postcss(a, b).plugins).toEqual([a, b])
})

it('saves plugins list as array', () => {
  let a = (): void => {}
  let b = (): void => {}
  expect(postcss([a, b]).plugins).toEqual([a, b])
})

it('takes plugin from other processor', () => {
  let a = (): void => {}
  let b = (): void => {}
  let c = (): void => {}
  let other = postcss([a, b])
  expect(postcss([other, c]).plugins).toEqual([a, b, c])
})

it('takes plugins from a a plugin returning a processor', () => {
  let a = (): void => {}
  let b = (): void => {}
  let c = (): void => {}
  let other = postcss([a, b])
  let meta = (() => other) as PluginCreator<void>
  meta.postcss = true
  expect(postcss([other, c]).plugins).toEqual([a, b, c])
})

it('creates plugin', () => {
  jest.spyOn(console, 'warn').mockImplementation(() => true)
  let plugin = (postcss as any).plugin('test', (filter?: string) => {
    return (root: Root) => {
      root.walkDecls(filter ?? 'two', i => {
        i.remove()
      })
    }
  })
  expect(console.warn).toHaveBeenCalledTimes(1)
  expect(console.warn).toHaveBeenCalledWith(expect.stringMatching(/test/))

  let func1: any = postcss(plugin).plugins[0]
  expect(func1.postcssPlugin).toEqual('test')
  expect(func1.postcssVersion).toMatch(/\d+.\d+.\d+/)

  let func2: any = postcss(plugin()).plugins[0]
  expect(func2.postcssPlugin).toEqual(func1.postcssPlugin)
  expect(func2.postcssVersion).toEqual(func1.postcssVersion)

  let result1 = postcss(plugin('one')).process('a{ one: 1; two: 2 }')
  expect(result1.css).toEqual('a{ two: 2 }')

  let result2 = postcss(plugin).process('a{ one: 1; two: 2 }')
  expect(result2.css).toEqual('a{ one: 1 }')
})

it('does not call plugin constructor', () => {
  jest.spyOn(console, 'warn').mockImplementation(() => true)
  let calls = 0
  let plugin = (postcss as any).plugin('test', () => {
    calls += 1
    return () => {}
  })
  expect(calls).toBe(0)
  expect(console.warn).toHaveBeenCalledTimes(1)

  postcss(plugin).process('a{}')
  expect(calls).toBe(1)

  postcss(plugin()).process('a{}')
  expect(calls).toBe(2)
})

it('creates a shortcut to process css', async () => {
  let plugin = (postcss as any).plugin('test', (str?: string) => {
    return (root: Root) => {
      root.walkDecls(i => {
        i.value = str ?? 'bar'
      })
    }
  })

  let result1 = plugin.process('a{value:foo}')
  expect(result1.css).toEqual('a{value:bar}')

  let result2 = plugin.process('a{value:foo}', {}, 'baz')
  expect(result2.css).toEqual('a{value:baz}')

  let result = await plugin.process('a{value:foo}', { from: 'a' }, 'baz')
  expect(result.opts).toEqual({ from: 'a' })
  expect(result.css).toEqual('a{value:baz}')
})

it('contains parser', () => {
  expect(postcss.parse('').type).toEqual('root')
})

it('contains stringifier', () => {
  expect(typeof postcss.stringify).toEqual('function')
})

it('allows to build own CSS', () => {
  let root = postcss.root({ raws: { after: '\n' } })
  let comment = postcss.comment({ text: 'Example' })
  let media = postcss.atRule({ name: 'media', params: 'screen' })
  let rule = postcss.rule({ selector: 'a' })
  let decl = postcss.decl({ prop: 'color', value: 'black' })

  root.append(comment)
  rule.append(decl)
  media.append(rule)
  root.append(media)

  expect(root.toString()).toEqual(
    '/* Example */\n' +
      '@media screen {\n' +
      '    a {\n' +
      '        color: black\n' +
      '    }\n' +
      '}\n'
  )
})

it('contains list module', () => {
  expect(postcss.list.space('a b')).toEqual(['a', 'b'])
})

it('works with null', () => {
  expect(() => {
    // @ts-expect-error
    postcss([() => {}]).process(null).css
  }).toThrow(/PostCSS received null instead of CSS string/)
})
