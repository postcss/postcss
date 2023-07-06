import postcss = require('../lib/postcss.js')
import { restoreAll, spyOn } from 'nanospy'
import { test } from 'uvu'
import { equal, is, match, throws, type } from 'uvu/assert'

import postcssDefault, { PluginCreator, Root } from '../lib/postcss.js'
import Processor from '../lib/processor.js'

test.after.each(() => {
  restoreAll()
})

test('default matches module.exports', () => {
  is(postcss, postcssDefault)
})

test('creates plugins list', () => {
  let processor = postcss()
  is(processor instanceof Processor, true)
  equal(processor.plugins, [])
})

test('saves plugins list', () => {
  let a = (): void => {}
  let b = (): void => {}
  equal(postcss(a, b).plugins, [a, b])
})

test('saves plugins list as array', () => {
  let a = (): void => {}
  let b = (): void => {}
  equal(postcss([a, b]).plugins, [a, b])
})

test('takes plugin from other processor', () => {
  let a = (): void => {}
  let b = (): void => {}
  let c = (): void => {}
  let other = postcss([a, b])
  equal(postcss([other, c]).plugins, [a, b, c])
})

test('takes plugins from a a plugin returning a processor', () => {
  let a = (): void => {}
  let b = (): void => {}
  let c = (): void => {}
  let other = postcss([a, b])
  let meta = (() => other) as PluginCreator<void>
  meta.postcss = true
  equal(postcss([other, c]).plugins, [a, b, c])
})

test('contains parser', () => {
  is(postcss.parse('').type, 'root')
})

test('contains stringifier', () => {
  type(postcss.stringify, 'function')
})

test('allows to build own CSS', () => {
  let root = postcss.root({ raws: { after: '\n' } })
  let comment = postcss.comment({ text: 'Example' })
  let media = postcss.atRule({ name: 'media', params: 'screen' })
  let rule = postcss.rule({ selector: 'a' })
  let decl = postcss.decl({ prop: 'color', value: 'black' })

  root.append(comment)
  rule.append(decl)
  media.append(rule)
  root.append(media)

  is(
    root.toString(),
    '/* Example */\n' +
      '@media screen {\n' +
      '    a {\n' +
      '        color: black\n' +
      '    }\n' +
      '}\n'
  )
})

test('allows to build own CSS with Document', () => {
  let document = postcss.document()
  let root = postcss.root({ raws: { after: '\n' } })
  let comment = postcss.comment({ text: 'Example' })
  let media = postcss.atRule({ name: 'media', params: 'screen' })
  let rule = postcss.rule({ selector: 'a' })
  let decl = postcss.decl({ prop: 'color', value: 'black' })

  root.append(comment)
  rule.append(decl)
  media.append(rule)
  root.append(media)
  document.append(root)

  is(
    document.toString(),
    '/* Example */\n' +
      '@media screen {\n' +
      '    a {\n' +
      '        color: black\n' +
      '    }\n' +
      '}\n'
  )
})

test('contains list module', () => {
  equal(postcss.list.space('a b'), ['a', 'b'])
})

test('works with null', () => {
  throws(() => {
    // @ts-expect-error
    postcss([() => {}]).process(null).css
  }, /PostCSS received null instead of CSS string/)
})

test('has deprecated method to create plugins', () => {
  let warn = spyOn(console, 'warn', () => {})
  let plugin = (postcss as any).plugin('test', (filter?: string) => {
    return (root: Root) => {
      root.walkDecls(filter ?? 'two', i => {
        i.remove()
      })
    }
  })

  equal(warn.callCount, 0)

  let func1: any = postcss(plugin).plugins[0]
  is(func1.postcssPlugin, 'test')
  match(func1.postcssVersion, /\d+.\d+.\d+/)
  equal(warn.callCount, 1)

  let func2: any = postcss(plugin()).plugins[0]
  equal(func2.postcssPlugin, func1.postcssPlugin)
  equal(func2.postcssVersion, func1.postcssVersion)

  let result1 = postcss(plugin('one')).process('a{ one: 1; two: 2 }')
  is(result1.css, 'a{ two: 2 }')

  let result2 = postcss(plugin).process('a{ one: 1; two: 2 }')
  is(result2.css, 'a{ one: 1 }')

  equal(warn.callCount, 1)
  match(warn.calls[0][0], /postcss\.plugin was deprecated/)
})

test('creates a shortcut to process css', async () => {
  let warn = spyOn(console, 'warn', () => {})
  let plugin = (postcss as any).plugin('test', (str?: string) => {
    return (root: Root) => {
      root.walkDecls(i => {
        i.value = str ?? 'bar'
      })
    }
  })

  let result1 = plugin.process('a{value:foo}')
  is(result1.css, 'a{value:bar}')

  let result2 = plugin.process('a{value:foo}', {}, 'baz')
  is(result2.css, 'a{value:baz}')

  let result = await plugin.process('a{value:foo}', { from: 'a' }, 'baz')
  equal(result.opts, { from: 'a' })
  is(result.css, 'a{value:baz}')

  equal(warn.callCount, 1)
})

test('does not call plugin constructor', () => {
  let warn = spyOn(console, 'warn', () => {})
  let calls = 0
  let plugin = (postcss as any).plugin('test', () => {
    calls += 1
    return () => {}
  })
  is(calls, 0)

  postcss(plugin).process('a{}')
  is(calls, 1)

  postcss(plugin()).process('a{}')
  is(calls, 2)

  equal(warn.callCount, 1)
})

test.run()
