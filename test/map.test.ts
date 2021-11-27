import { SourceMapConsumer, SourceMapGenerator } from 'source-map-js'
import { removeSync, outputFileSync } from 'fs-extra'
import { is, type, equal, match } from 'uvu/assert'
import { join, resolve, parse } from 'path'
import { existsSync } from 'fs'
import { test } from 'uvu'

import postcss, { SourceMap, Rule, Root } from '../lib/postcss.js'
import PreviousMap from '../lib/previous-map.js'

function consumer(map: SourceMap): any {
  return (SourceMapConsumer as any).fromSourceMap(map)
}

function read(result: { css: string }): any {
  let prev = new PreviousMap(result.css, {})
  return prev.consumer()
}

let dir = join(__dirname, 'map-fixtures')

let doubler = postcss((css: Root) => {
  css.walkDecls(decl => {
    decl.parent?.prepend(decl.clone())
  })
})
let lighter = postcss((css: Root) => {
  css.walkDecls(decl => {
    decl.value = 'white'
  })
})

test.after.each(() => {
  if (existsSync(dir)) removeSync(dir)
})

test('adds map field only on request', () => {
  type(postcss([() => {}]).process('a {}').map, 'undefined')
})

test('return map generator', () => {
  let map = postcss([() => {}]).process('a {}', {
    map: { inline: false }
  }).map
  is(map instanceof SourceMapGenerator, true)
})

test('generate right source map', () => {
  let css = 'a {\n  color: black;\n  }'
  let processor = postcss((root: Root) => {
    root.walkRules(rule => {
      rule.selector = 'strong'
    })
    root.walkDecls(decl => {
      decl.parent?.prepend(decl.clone({ prop: 'background', value: 'black' }))
    })
  })

  let result = processor.process(css, {
    from: 'a.css',
    to: 'b.css',
    map: true
  })
  let map = read(result)

  is(map.file, 'b.css')

  equal(map.originalPositionFor({ line: 1, column: 0 }), {
    source: 'a.css',
    line: 1,
    column: 0,
    name: null
  })
  equal(map.originalPositionFor({ line: 1, column: 2 }), {
    source: 'a.css',
    line: 1,
    column: 0,
    name: null
  })
  equal(map.originalPositionFor({ line: 2, column: 2 }), {
    source: 'a.css',
    line: 2,
    column: 2,
    name: null
  })
  equal(map.originalPositionFor({ line: 3, column: 2 }), {
    source: 'a.css',
    line: 2,
    column: 2,
    name: null
  })
  equal(map.originalPositionFor({ line: 3, column: 14 }), {
    source: 'a.css',
    line: 2,
    column: 14,
    name: null
  })
  equal(map.originalPositionFor({ line: 4, column: 2 }), {
    source: 'a.css',
    line: 3,
    column: 2,
    name: null
  })
})

test('changes previous source map', () => {
  let css = 'a { color: black }'

  let doubled = doubler.process(css, {
    from: 'a.css',
    to: 'b.css',
    map: { inline: false }
  })

  let lighted = lighter.process(doubled.css, {
    from: 'b.css',
    to: 'c.css',
    map: { prev: doubled.map }
  })

  let map = consumer(lighted.map)
  equal(map.originalPositionFor({ line: 1, column: 18 }), {
    source: 'a.css',
    line: 1,
    column: 4,
    name: null
  })
})

test('adds source map annotation', () => {
  let css = 'a { }/*# sourceMappingURL=a.css.map */'
  let result = postcss([() => {}]).process(css, {
    from: 'a.css',
    to: 'b.css',
    map: { inline: false }
  })

  is(result.css, 'a { }\n/*# sourceMappingURL=b.css.map */')
})

test('misses source map annotation, if user ask', () => {
  let css = 'a { }'
  let result = postcss([() => {}]).process(css, {
    from: 'a.css',
    to: 'b.css',
    map: { annotation: false }
  })

  is(result.css, css)
})

test('misses source map annotation, if previous map missed it', () => {
  let css = 'a { }'

  let step1 = postcss([() => {}]).process(css, {
    from: 'a.css',
    to: 'b.css',
    map: { annotation: false }
  })

  let step2 = postcss([() => {}]).process(step1.css, {
    from: 'b.css',
    to: 'c.css',
    map: { prev: step1.map }
  })

  is(step2.css, css)
})

test('uses user path in annotation, relative to options.to', () => {
  let result = postcss([() => {}]).process('a { }', {
    from: 'source/a.css',
    to: 'build/b.css',
    map: { annotation: 'maps/b.map' }
  })

  is(result.css, 'a { }\n/*# sourceMappingURL=maps/b.map */')
  let map = consumer(result.map)

  is(map.file, join('..', 'b.css'))
  is(
    map.originalPositionFor({ line: 1, column: 0 }).source,
    '../../source/a.css'
  )
})

test('generates inline map', () => {
  let css = 'a { }'

  let inline = postcss([() => {}]).process(css, {
    from: 'a.css',
    to: 'b.css',
    map: { inline: true }
  })

  type(inline.map, 'undefined')
  match(inline.css, /# sourceMappingURL=data:/)

  let separated = postcss([() => {}]).process(css, {
    from: 'a.css',
    to: 'b.css',
    map: { inline: false }
  })

  let base64 = Buffer.from(separated.map.toString()).toString('base64')
  let end = inline.css.slice(-base64.length - 3)
  is(end, base64 + ' */')
})

test('generates inline map by default', () => {
  let inline = postcss([() => {}]).process('a { }', {
    from: 'a.css',
    to: 'b.css',
    map: true
  })
  match(inline.css, /# sourceMappingURL=data:/)
})

test('generates separated map if previous map was not inlined', () => {
  let step1 = doubler.process('a { color: black }', {
    from: 'a.css',
    to: 'b.css',
    map: { inline: false }
  })
  let step2 = lighter.process(step1.css, {
    from: 'b.css',
    to: 'c.css',
    map: { prev: step1.map }
  })

  type(step2.map, 'object')
})

test('generates separated map on annotation option', () => {
  let result = postcss([() => {}]).process('a { }', {
    from: 'a.css',
    to: 'b.css',
    map: { annotation: false }
  })

  type(result.map, 'object')
})

test('allows change map type', () => {
  let step1 = postcss([() => {}]).process('a { }', {
    from: 'a.css',
    to: 'b.css',
    map: { inline: true }
  })

  let step2 = postcss([() => {}]).process(step1.css, {
    from: 'b.css',
    to: 'c.css',
    map: { inline: false }
  })

  type(step2.map, 'object')
  match(step2.css, /# sourceMappingURL=c\.css\.map/)
})

test('misses check files on requires', () => {
  let file = join(dir, 'a.css')

  let step1 = doubler.process('a { }', {
    from: 'a.css',
    to: file,
    map: { inline: false }
  })

  outputFileSync(file + '.map', step1.map.toString())
  let step2 = lighter.process(step1.css, {
    from: file,
    to: 'b.css',
    map: false
  })

  type(step2.map, 'undefined')
})

test('works in subdirs', () => {
  let result = doubler.process('a { }', {
    from: 'from/a.css',
    to: 'out/b.css',
    map: { inline: false }
  })

  match(result.css, /sourceMappingURL=b.css.map/)

  let map = consumer(result.map)
  is(map.file, 'b.css')
  equal(map.sources, ['../from/a.css'])
})

test('uses map from subdir', () => {
  let step1 = doubler.process('a { }', {
    from: 'a.css',
    to: 'out/b.css',
    map: { inline: false }
  })

  let step2 = doubler.process(step1.css, {
    from: 'out/b.css',
    to: 'out/two/c.css',
    map: { prev: step1.map }
  })

  let source = consumer(step2.map).originalPositionFor({
    line: 1,
    column: 0
  }).source
  is(source, '../../a.css')

  let step3 = doubler.process(step2.css, {
    from: 'c.css',
    to: 'd.css',
    map: { prev: step2.map }
  })

  source = consumer(step3.map).originalPositionFor({
    line: 1,
    column: 0
  }).source
  is(source, '../../a.css')
})

test('uses map from subdir if it inlined', () => {
  let step1 = doubler.process('a { }', {
    from: 'a.css',
    to: 'out/b.css',
    map: true
  })

  let step2 = doubler.process(step1.css, {
    from: 'out/b.css',
    to: 'out/two/c.css',
    map: { inline: false }
  })

  let source = consumer(step2.map).originalPositionFor({
    line: 1,
    column: 0
  }).source
  is(source, '../../a.css')
})

test('uses map from subdir if it written as a file', () => {
  let step1 = doubler.process('a { }', {
    from: 'source/a.css',
    to: 'one/b.css',
    map: { annotation: 'maps/b.css.map', inline: false }
  })

  let source = consumer(step1.map).originalPositionFor({
    line: 1,
    column: 0
  }).source
  is(source, '../../source/a.css')

  let file = join(dir, 'one', 'maps', 'b.css.map')
  outputFileSync(file, step1.map.toString())

  let step2 = doubler.process(step1.css, {
    from: join(dir, 'one', 'b.css'),
    to: join(dir, 'two', 'c.css'),
    map: true
  })

  source = consumer(step2.map).originalPositionFor({
    line: 1,
    column: 0
  }).source
  is(source, '../source/a.css')
})

test('works with different types of maps', () => {
  let step1 = doubler.process('a { }', {
    from: 'a.css',
    to: 'b.css',
    map: { inline: false }
  })

  let map = step1.map
  let maps = [map, consumer(map), map.toJSON(), map.toString()]

  for (let i of maps) {
    let step2 = doubler.process(step1.css, {
      from: 'b.css',
      to: 'c.css',
      map: { prev: i }
    })
    let source = consumer(step2.map).originalPositionFor({
      line: 1,
      column: 0
    }).source
    is(source, 'a.css')
  }
})

test('sets source content by default', () => {
  let result = doubler.process('a { }', {
    from: 'a.css',
    to: 'out/b.css',
    map: true
  })

  is(read(result).sourceContentFor('../a.css'), 'a { }')
})

test('misses source content on request', () => {
  let result = doubler.process('a { }', {
    from: 'a.css',
    to: 'out/b.css',
    map: { sourcesContent: false }
  })

  is(read(result).sourceContentFor('../a.css'), null)
})

test('misses source content if previous not have', () => {
  let step1 = doubler.process('a { }', {
    from: 'a.css',
    to: 'out/a.css',
    map: { sourcesContent: false }
  })

  let file1 = postcss.parse(step1.css, {
    from: 'a.css',
    map: { prev: step1.map }
  })
  let file2 = postcss.parse('b { }', { from: 'b.css', map: true })

  if (file1.first) file2.append(file1.first.clone())
  let step2 = file2.toResult({ to: 'c.css', map: true })

  is(read(step2).sourceContentFor('b.css'), null)
})

test('misses source content on request in multiple steps', () => {
  let step1 = doubler.process('a { }', {
    from: 'a.css',
    to: 'out/a.css',
    map: { sourcesContent: true }
  })

  let file1 = postcss.parse(step1.css, {
    from: 'a.css',
    map: { prev: step1.map }
  })
  let file2 = postcss.parse('b { }', { from: 'b.css', map: true })

  if (file1.first) file2.append(file1.first.clone())
  let step2 = file2.toResult({
    to: 'c.css',
    map: { sourcesContent: false }
  })

  let map = read(step2)
  is(map.sourceContentFor('b.css'), null)
  is(map.sourceContentFor('../a.css'), null)
})

test('detects input file name from map', () => {
  let one = doubler.process('a { }', { to: 'a.css', map: true })
  let two = doubler.process(one.css, { map: { prev: one.map } })
  is(two.root.first?.source?.input.file, resolve('a.css'))
})

test('works without file names', () => {
  let step1 = doubler.process('a { }', { map: true })
  let step2 = doubler.process(step1.css)
  match(step2.css, /a { }\n\/\*/)
})

test('supports UTF-8', () => {
  let step1 = doubler.process('a { }', {
    from: 'вход.css',
    to: 'шаг1.css',
    map: true
  })
  let step2 = doubler.process(step1.css, {
    from: 'шаг1.css',
    to: 'выход.css'
  })

  is(read(step2).file, 'выход.css')
})

test('generates map for node created manually', () => {
  let contenter = postcss((css: Root) => {
    if (css.first && css.first.type === 'rule') {
      css.first.prepend({ selector: 'b' })
    }
  })
  let result = contenter.process('a:after{\n}', { map: true })
  let map = read(result)
  equal(map.originalPositionFor({ line: 2, column: 5 }), {
    source: '<no source>',
    column: 0,
    line: 1,
    name: null
  })
})

test('uses input file name as output file name', () => {
  let result = doubler.process('a{}', {
    from: 'a.css',
    map: { inline: false }
  })
  is(result.map.toJSON().file, 'a.css')
})

test('uses to.css as default output name', () => {
  let result = doubler.process('a{}', { map: { inline: false } })
  is(result.map.toJSON().file, 'to.css')
})

test('supports annotation comment in any place', () => {
  let css = '/*# sourceMappingURL=a.css.map */a { }'
  let result = postcss([() => {}]).process(css, {
    from: 'a.css',
    to: 'b.css',
    map: { inline: false }
  })

  is(result.css, 'a { }\n/*# sourceMappingURL=b.css.map */')
})

test('does not update annotation on request', () => {
  let css = 'a { }/*# sourceMappingURL=a.css.map */'
  let result = postcss([() => {}]).process(css, {
    from: 'a.css',
    to: 'b.css',
    map: { annotation: false, inline: false }
  })

  is(result.css, 'a { }/*# sourceMappingURL=a.css.map */')
})

test('clears source map', () => {
  let css1 = postcss.root().toResult({ map: true }).css
  let css2 = postcss.root().toResult({ map: true }).css

  let root = postcss.root()
  root.append(css1)
  root.append(css2)

  let css = root.toResult({ map: true }).css
  is(css.match(/sourceMappingURL/g)?.length, 1)
})

test('uses Windows line separation too', () => {
  let result = postcss([() => {}]).process('a {\r\n}', { map: true })
  match(result.css, /a {\r\n}\r\n\/\*# sourceMappingURL=/)
})

test('`map.from` should override the source map sources', () => {
  let result = postcss([() => {}]).process('a{}', {
    map: {
      inline: false,
      from: 'file:///dir/a.css'
    }
  })
  equal(result.map.toJSON().sources, ['file:///dir/a.css'])
})

test('preserves absolute urls in `to`', () => {
  let result = postcss([() => {}]).process('a{}', {
    from: '/dir/to/a.css',
    to: 'http://example.com/a.css',
    map: { inline: false }
  })
  is(result.map.toJSON().file, 'http://example.com/a.css')
})

test('preserves absolute urls in sources', () => {
  let result = postcss([() => {}]).process('a{}', {
    from: 'file:///dir/a.css',
    to: 'http://example.com/a.css',
    map: { inline: false }
  })
  equal(result.map.toJSON().sources, ['file:///dir/a.css'])
})

test('uses absolute path on request', () => {
  let result = postcss([() => {}]).process('a{}', {
    from: '/dir/a.css',
    to: '/dir/b.css',
    map: { inline: false, absolute: true }
  })
  let root = '/'
  if (process.platform === 'win32') {
    root = '/' + parse(process.cwd()).root.replace(/\\/g, '/')
  }
  equal(result.map.toJSON().sources, [`file://${root}dir/a.css`])
})

test('preserves absolute urls in sources from previous map', () => {
  let result1 = postcss([() => {}]).process('a{}', {
    from: 'http://example.com/a.css',
    to: 'http://example.com/b.css',
    map: true
  })
  let result2 = postcss([() => {}]).process(result1.css, {
    to: 'http://example.com/c.css',
    map: {
      inline: false
    }
  })
  is(result2.root.source?.input.file, 'http://example.com/b.css')
  equal(result2.map.toJSON().sources, ['http://example.com/a.css'])
})

test('allows dynamic annotations', () => {
  let result = postcss([() => {}]).process('a{}', {
    to: 'out.css',
    map: {
      annotation(to, root) {
        let rule = root.first as Rule
        return to + '-' + rule.selector + '.map'
      }
    }
  })
  is(result.css, 'a{}\n/*# sourceMappingURL=out.css-a.map */')
})

test('uses URLs in sources', () => {
  let result = postcss([() => {}]).process('a{}', {
    from: 'a b.css',
    to: 'dir/b.css',
    map: { inline: false }
  })
  equal(result.map.toJSON().sources, ['../a%20b.css'])
})

test('generates correct inline map with empty processor', () => {
  let result = postcss().process('a {} /*hello world*/', {
    map: true
  })

  match(result.css, /a {} \/\*hello world\*\/\n\/\*# sourceMappingURL=/)
})

test('generates correct inline map and multiple comments', () => {
  let css =
    'a {}/*# sourceMappingURL=a.css.map */\n' +
    '/*# sourceMappingURL=b.css.map */\n' +
    'b {}\n/*# sourceMappingURL=c.css.map */'
  let result = postcss().process(css, {
    map: true
  })

  match(result.css, /a {}\nb {}\n\/\*# sourceMappingURL=/)
})

test('generates correct sources with empty processor', () => {
  let result = postcss().process('a {} /*hello world*/', {
    from: 'a.css',
    to: 'b.css',
    map: { inline: false }
  })

  equal(result.map.toJSON().sources, ['a.css'])
})

test('generates map object with empty processor', () => {
  let result = postcss().process('a {} /*hello world*/', {
    from: 'a.css',
    to: 'b.css',
    map: true
  })

  let map = read(result)

  equal(map.originalPositionFor({ line: 1, column: 0 }), {
    source: 'a.css',
    line: 1,
    column: 0,
    name: null
  })
})

test('supports previous map with empty processor', () => {
  let result1 = postcss().process('a{}', {
    from: '/a.css',
    to: '/b.css',
    map: {
      sourcesContent: true,
      inline: false
    }
  })
  equal(result1.map.toJSON(), {
    version: 3,
    sources: ['a.css'],
    names: [],
    mappings: 'AAAA',
    file: 'b.css',
    sourcesContent: ['a{}']
  })

  let result2 = postcss().process(result1.css, {
    from: '/b.css',
    to: '/c.css',
    map: {
      prev: result1.map
    }
  })
  equal(result2.map.toJSON().sources, ['a.css'])
  equal(result2.map.toJSON().sourcesContent, ['a{}'])
})

test('supports previous inline map with empty processor', () => {
  let result1 = postcss().process('a{}', {
    from: '/a.css',
    to: '/b.css',
    map: true
  })
  let result2 = postcss().process(result1.css, {
    from: '/b.css',
    to: '/c.css'
  })
  let root3 = postcss.parse(result2.css, { from: '/c.css' })
  match((root3.source?.input.origin(1, 0) as any).file, 'a.css')
})

test.run()
