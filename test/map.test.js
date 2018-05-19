const PreviousMap = require('../lib/previous-map')
const postcss = require('../lib/postcss')

const mozilla = require('source-map')
const path = require('path')
const fs = require('fs-extra')

function consumer (map) {
  return mozilla.SourceMapConsumer.fromSourceMap(map)
}

function read (result) {
  const prev = new PreviousMap(result.css, { })
  return prev.consumer()
}

const dir = path.join(__dirname, 'map-fixtures')

const doubler = postcss(css => {
  css.walkDecls(decl => decl.parent.prepend(decl.clone()))
})
const lighter = postcss(css => {
  css.walkDecls(decl => {
    decl.value = 'white'
  })
})

afterEach(() => {
  if (fs.existsSync(dir)) fs.removeSync(dir)
})

it('adds map field only on request', () => {
  expect(postcss().process('a {}').map).not.toBeDefined()
})

it('return map generator', () => {
  const map = postcss().process('a {}', { map: { inline: false } }).map
  expect(map instanceof mozilla.SourceMapGenerator).toBeTruthy()
})

it('generate right source map', () => {
  const css = 'a {\n  color: black;\n  }'
  const processor = postcss(root => {
    root.walkRules(rule => {
      rule.selector = 'strong'
    })
    root.walkDecls(decl => {
      decl.parent.prepend(decl.clone({ prop: 'background' }))
    })
  })

  const result = processor.process(css, {
    from: 'a.css',
    to: 'b.css',
    map: true
  })
  const map = read(result)

  expect(map.file).toEqual('b.css')

  expect(map.originalPositionFor({ line: 1, column: 0 })).toEqual({
    source: 'a.css',
    line: 1,
    column: 0,
    name: null
  })
  expect(map.originalPositionFor({ line: 2, column: 2 })).toEqual({
    source: 'a.css',
    line: 2,
    column: 2,
    name: null
  })
  expect(map.originalPositionFor({ line: 3, column: 2 })).toEqual({
    source: 'a.css',
    line: 2,
    column: 2,
    name: null
  })
})

it('changes previous source map', () => {
  const css = 'a { color: black }'

  const doubled = doubler.process(css, {
    from: 'a.css',
    to: 'b.css',
    map: { inline: false }
  })

  const lighted = lighter.process(doubled.css, {
    from: 'b.css',
    to: 'c.css',
    map: { prev: doubled.map }
  })

  const map = consumer(lighted.map)
  expect(map.originalPositionFor({ line: 1, column: 18 })).toEqual({
    source: 'a.css',
    line: 1,
    column: 4,
    name: null
  })
})

it('adds source map annotation', () => {
  const css = 'a { }/*# sourceMappingURL=a.css.map */'
  const result = postcss().process(css, {
    from: 'a.css',
    to: 'b.css',
    map: { inline: false }
  })

  expect(result.css).toEqual('a { }\n/*# sourceMappingURL=b.css.map */')
})

it('misses source map annotation, if user ask', () => {
  const css = 'a { }'
  const result = postcss().process(css, {
    from: 'a.css',
    to: 'b.css',
    map: { annotation: false }
  })

  expect(result.css).toEqual(css)
})

it('misses source map annotation, if previous map missed it', () => {
  const css = 'a { }'

  const step1 = postcss().process(css, {
    from: 'a.css',
    to: 'b.css',
    map: { annotation: false }
  })

  const step2 = postcss().process(step1.css, {
    from: 'b.css',
    to: 'c.css',
    map: { prev: step1.map }
  })

  expect(step2.css).toEqual(css)
})

it('uses user path in annotation, relative to options.to', () => {
  const result = postcss().process('a { }', {
    from: 'source/a.css',
    to: 'build/b.css',
    map: { annotation: 'maps/b.map' }
  })

  expect(result.css).toEqual('a { }\n/*# sourceMappingURL=maps/b.map */')
  const map = consumer(result.map)

  expect(map.file).toEqual('../b.css')
  expect(map.originalPositionFor({ line: 1, column: 0 }).source)
    .toEqual('../../source/a.css')
})

it('generates inline map', () => {
  const css = 'a { }'

  const inline = postcss().process(css, {
    from: 'a.css',
    to: 'b.css',
    map: { inline: true }
  })

  expect(inline.map).not.toBeDefined()
  expect(inline.css).toMatch(/# sourceMappingURL=data:/)

  const separated = postcss().process(css, {
    from: 'a.css',
    to: 'b.css',
    map: { inline: false }
  })

  const base64 = Buffer.from(separated.map.toString()).toString('base64')
  const end = inline.css.slice(-base64.length - 3)
  expect(end).toEqual(base64 + ' */')
})

it('generates inline map by default', () => {
  const inline = postcss().process('a { }', {
    from: 'a.css',
    to: 'b.css',
    map: true
  })
  expect(inline.css).toMatch(/# sourceMappingURL=data:/)
})

it('generates separated map if previous map was not inlined', () => {
  const step1 = doubler.process('a { color: black }', {
    from: 'a.css',
    to: 'b.css',
    map: { inline: false }
  })
  const step2 = lighter.process(step1.css, {
    from: 'b.css',
    to: 'c.css',
    map: { prev: step1.map }
  })

  expect(typeof step2.map).toEqual('object')
})

it('generates separated map on annotation option', () => {
  const result = postcss().process('a { }', {
    from: 'a.css',
    to: 'b.css',
    map: { annotation: false }
  })

  expect(typeof result.map).toEqual('object')
})

it('allows change map type', () => {
  const step1 = postcss().process('a { }', {
    from: 'a.css',
    to: 'b.css',
    map: { inline: true }
  })

  const step2 = postcss().process(step1.css, {
    from: 'b.css',
    to: 'c.css',
    map: { inline: false }
  })

  expect(typeof step2.map).toEqual('object')
  expect(step2.css).toMatch(/# sourceMappingURL=c\.css\.map/)
})

it('misses check files on requires', () => {
  const file = path.join(dir, 'a.css')

  const step1 = doubler.process('a { }', {
    from: 'a.css',
    to: file,
    map: true
  })

  fs.outputFileSync(file + '.map', step1.map)
  const step2 = lighter.process(step1.css, {
    from: file,
    to: 'b.css',
    map: false
  })

  expect(step2.map).not.toBeDefined()
})

it('works in subdirs', () => {
  const result = doubler.process('a { }', {
    from: 'from/a.css',
    to: 'out/b.css',
    map: { inline: false }
  })

  expect(result.css).toMatch(/sourceMappingURL=b.css.map/)

  const map = consumer(result.map)
  expect(map.file).toEqual('b.css')
  expect(map.sources).toEqual(['../from/a.css'])
})

it('uses map from subdir', () => {
  const step1 = doubler.process('a { }', {
    from: 'a.css',
    to: 'out/b.css',
    map: { inline: false }
  })

  const step2 = doubler.process(step1.css, {
    from: 'out/b.css',
    to: 'out/two/c.css',
    map: { prev: step1.map }
  })

  let source = consumer(step2.map)
    .originalPositionFor({ line: 1, column: 0 }).source
  expect(source).toEqual('../../a.css')

  const step3 = doubler.process(step2.css, {
    from: 'c.css',
    to: 'd.css',
    map: { prev: step2.map }
  })

  source = consumer(step3.map)
    .originalPositionFor({ line: 1, column: 0 }).source
  expect(source).toEqual('../../a.css')
})

it('uses map from subdir if it inlined', () => {
  const step1 = doubler.process('a { }', {
    from: 'a.css',
    to: 'out/b.css',
    map: true
  })

  const step2 = doubler.process(step1.css, {
    from: 'out/b.css',
    to: 'out/two/c.css',
    map: { inline: false }
  })

  const source = consumer(step2.map)
    .originalPositionFor({ line: 1, column: 0 }).source
  expect(source).toEqual('../../a.css')
})

it('uses map from subdir if it written as a file', () => {
  const step1 = doubler.process('a { }', {
    from: 'source/a.css',
    to: 'one/b.css',
    map: { annotation: 'maps/b.css.map', inline: false }
  })

  let source = consumer(step1.map)
    .originalPositionFor({ line: 1, column: 0 }).source
  expect(source).toEqual('../../source/a.css')

  const file = path.join(dir, 'one', 'maps', 'b.css.map')
  fs.outputFileSync(file, step1.map)

  const step2 = doubler.process(step1.css, {
    from: path.join(dir, 'one', 'b.css'),
    to: path.join(dir, 'two', 'c.css'),
    map: true
  })

  source = consumer(step2.map)
    .originalPositionFor({ line: 1, column: 0 }).source
  expect(source).toEqual('../source/a.css')
})

it('works with different types of maps', () => {
  const step1 = doubler.process('a { }', {
    from: 'a.css',
    to: 'b.css',
    map: { inline: false }
  })

  const map = step1.map
  const maps = [map, consumer(map), map.toJSON(), map.toString()]

  for (const i of maps) {
    const step2 = doubler.process(step1.css, {
      from: 'b.css',
      to: 'c.css',
      map: { prev: i }
    })
    const source = consumer(step2.map)
      .originalPositionFor({ line: 1, column: 0 }).source
    expect(source).toEqual('a.css')
  }
})

it('sets source content by default', () => {
  const result = doubler.process('a { }', {
    from: 'a.css',
    to: 'out/b.css',
    map: true
  })

  expect(read(result).sourceContentFor('../a.css')).toEqual('a { }')
})

it('misses source content on request', () => {
  const result = doubler.process('a { }', {
    from: 'a.css',
    to: 'out/b.css',
    map: { sourcesContent: false }
  })

  expect(read(result).sourceContentFor('../a.css')).toBeNull()
})

it('misses source content if previous not have', () => {
  const step1 = doubler.process('a { }', {
    from: 'a.css',
    to: 'out/a.css',
    map: { sourcesContent: false }
  })

  const file1 = postcss.parse(step1.css, {
    from: 'a.css',
    map: { prev: step1.map }
  })
  const file2 = postcss.parse('b { }', { from: 'b.css', map: true })

  file2.append(file1.first.clone())
  const step2 = file2.toResult({ to: 'c.css', map: true })

  expect(read(step2).sourceContentFor('b.css')).toBeNull()
})

it('misses source content on request in multiple steps', () => {
  const step1 = doubler.process('a { }', {
    from: 'a.css',
    to: 'out/a.css',
    map: { sourcesContent: true }
  })

  const file1 = postcss.parse(step1.css, {
    from: 'a.css',
    map: { prev: step1.map }
  })
  const file2 = postcss.parse('b { }', { from: 'b.css', map: true })

  file2.append(file1.first.clone())
  const step2 = file2.toResult({
    to: 'c.css',
    map: { sourcesContent: false }
  })

  const map = read(step2)
  expect(map.sourceContentFor('b.css')).toBeNull()
  expect(map.sourceContentFor('../a.css')).toBeNull()
})

it('detects input file name from map', () => {
  const one = doubler.process('a { }', { to: 'a.css', map: true })
  const two = doubler.process(one.css, { map: { prev: one.map } })
  expect(two.root.first.source.input.file).toEqual(path.resolve('a.css'))
})

it('works without file names', () => {
  const step1 = doubler.process('a { }', { map: true })
  const step2 = doubler.process(step1.css)
  expect(step2.css).toMatch(/a \{ \}\n\/\*/)
})

it('supports UTF-8', () => {
  const step1 = doubler.process('a { }', {
    from: 'вход.css',
    to: 'шаг1.css',
    map: true
  })
  const step2 = doubler.process(step1.css, {
    from: 'шаг1.css',
    to: 'выход.css'
  })

  expect(read(step2).file).toEqual('выход.css')
})

it('generates map for node created manually', () => {
  const contenter = postcss(css => {
    css.first.prepend({ prop: 'content', value: '""' })
  })
  const result = contenter.process('a:after{\n}', { map: true })
  const map = read(result)
  expect(map.originalPositionFor({ line: 2, column: 5 })).toEqual({
    source: '<no source>',
    column: 0,
    line: 1,
    name: null
  })
})

it('uses input file name as output file name', () => {
  const result = doubler.process('a{}', {
    from: 'a.css',
    map: { inline: false }
  })
  expect(result.map.toJSON().file).toEqual('a.css')
})

it('uses to.css as default output name', () => {
  const result = doubler.process('a{}', { map: { inline: false } })
  expect(result.map.toJSON().file).toEqual('to.css')
})

it('supports annotation comment in any place', () => {
  const css = '/*# sourceMappingURL=a.css.map */a { }'
  const result = postcss().process(css, {
    from: 'a.css',
    to: 'b.css',
    map: { inline: false }
  })

  expect(result.css).toEqual('a { }\n/*# sourceMappingURL=b.css.map */')
})

it('does not update annotation on request', () => {
  const css = 'a { }/*# sourceMappingURL=a.css.map */'
  const result = postcss().process(css, {
    from: 'a.css',
    to: 'b.css',
    map: { annotation: false, inline: false }
  })

  expect(result.css).toEqual('a { }/*# sourceMappingURL=a.css.map */')
})

it('clears source map', () => {
  const css1 = postcss.root().toResult({ map: true }).css
  const css2 = postcss.root().toResult({ map: true }).css

  const root = postcss.root()
  root.append(css1)
  root.append(css2)

  const css = root.toResult({ map: true }).css
  expect(css.match(/sourceMappingURL/g)).toHaveLength(1)
})

it('uses Windows line separation too', () => {
  const result = postcss().process('a {\r\n}', { map: true })
  expect(result.css).toMatch(/a \{\r\n\}\r\n\/\*# sourceMappingURL=/)
})

it('`map.from` should override the source map sources', () => {
  const result = postcss().process('a{}', {
    map: {
      inline: false,
      from: 'file:///dir/a.css'
    }
  })
  expect(result.map.toJSON().sources).toEqual(['file:///dir/a.css'])
})

it('preserves absolute urls in `to`', () => {
  const result = postcss().process('a{}', {
    from: '/dir/to/a.css',
    to: 'http://example.com/a.css',
    map: { inline: false }
  })
  expect(result.map.toJSON().file).toEqual('http://example.com/a.css')
})

it('preserves absolute urls in sources', () => {
  const result = postcss().process('a{}', {
    from: 'file:///dir/a.css',
    to: 'http://example.com/a.css',
    map: { inline: false }
  })
  expect(result.map.toJSON().sources).toEqual(['file:///dir/a.css'])
})

it('preserves absolute urls in sources from previous map', () => {
  const result1 = postcss().process('a{}', {
    from: 'http://example.com/a.css',
    to: 'http://example.com/b.css',
    map: true
  })
  const result2 = postcss().process(result1.css, {
    to: 'http://example.com/c.css',
    map: {
      inline: false
    }
  })
  expect(result2.root.source.input.file).toEqual('http://example.com/b.css')
  expect(result2.map.toJSON().sources).toEqual(['http://example.com/a.css'])
})
