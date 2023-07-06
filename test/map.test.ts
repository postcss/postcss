import {
  existsSync,
  lstatSync,
  mkdirSync,
  readdirSync,
  rmdirSync,
  unlinkSync,
  writeFileSync
} from 'fs'
import { join, parse, resolve } from 'path'
import { SourceMapConsumer, SourceMapGenerator } from 'source-map-js'
import { pathToFileURL } from 'url'
import { test } from 'uvu'
import { equal, is, match, type } from 'uvu/assert'

import postcss, { Root, Rule, SourceMap } from '../lib/postcss.js'
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

function deleteDir(path: string): void {
  if (existsSync(path)) {
    readdirSync(path).forEach(i => {
      let file = join(path, i)
      if (lstatSync(file).isDirectory()) {
        deleteDir(file)
      } else {
        unlinkSync(file)
      }
    })
    rmdirSync(path)
  }
}

test.after.each(() => {
  deleteDir(dir)
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
    map: true,
    to: 'b.css'
  })
  let map = read(result)

  is(map.file, 'b.css')

  equal(map.originalPositionFor({ column: 0, line: 1 }), {
    column: 0,
    line: 1,
    name: null,
    source: 'a.css'
  })
  equal(map.originalPositionFor({ column: 2, line: 1 }), {
    column: 0,
    line: 1,
    name: null,
    source: 'a.css'
  })
  equal(map.originalPositionFor({ column: 2, line: 2 }), {
    column: 2,
    line: 2,
    name: null,
    source: 'a.css'
  })
  equal(map.originalPositionFor({ column: 2, line: 3 }), {
    column: 2,
    line: 2,
    name: null,
    source: 'a.css'
  })
  equal(map.originalPositionFor({ column: 14, line: 3 }), {
    column: 14,
    line: 2,
    name: null,
    source: 'a.css'
  })
  equal(map.originalPositionFor({ column: 2, line: 4 }), {
    column: 2,
    line: 3,
    name: null,
    source: 'a.css'
  })
})

test('generates right source map for @layer', () => {
  let css = '@layer extensions {\n  @layer one, two\n}'
  let processor = postcss(() => {
    /* noop */
  })

  let result = processor.process(css, {
    from: 'a.css',
    map: true,
    to: 'b.css'
  })

  read(result)
})

test('changes previous source map', () => {
  let css = 'a { color: black }'

  let doubled = doubler.process(css, {
    from: 'a.css',
    map: { inline: false },
    to: 'b.css'
  })

  let lighted = lighter.process(doubled.css, {
    from: 'b.css',
    map: { prev: doubled.map },
    to: 'c.css'
  })

  let map = consumer(lighted.map)
  equal(map.originalPositionFor({ column: 18, line: 1 }), {
    column: 4,
    line: 1,
    name: null,
    source: 'a.css'
  })
})

test('adds source map annotation', () => {
  let css = 'a { }/*# sourceMappingURL=a.css.map */'
  let result = postcss([() => {}]).process(css, {
    from: 'a.css',
    map: { inline: false },
    to: 'b.css'
  })

  is(result.css, 'a { }\n/*# sourceMappingURL=b.css.map */')
})

test('misses source map annotation, if user ask', () => {
  let css = 'a { }'
  let result = postcss([() => {}]).process(css, {
    from: 'a.css',
    map: { annotation: false },
    to: 'b.css'
  })

  is(result.css, css)
})

test('misses source map annotation, if previous map missed it', () => {
  let css = 'a { }'

  let step1 = postcss([() => {}]).process(css, {
    from: 'a.css',
    map: { annotation: false },
    to: 'b.css'
  })

  let step2 = postcss([() => {}]).process(step1.css, {
    from: 'b.css',
    map: { prev: step1.map },
    to: 'c.css'
  })

  is(step2.css, css)
})

test('uses user path in annotation, relative to options.to', () => {
  let result = postcss([() => {}]).process('a { }', {
    from: 'source/a.css',
    map: { annotation: 'maps/b.map' },
    to: 'build/b.css'
  })

  is(result.css, 'a { }\n/*# sourceMappingURL=maps/b.map */')
  let map = consumer(result.map)

  is(map.file, join('..', 'b.css'))
  is(
    map.originalPositionFor({ column: 0, line: 1 }).source,
    '../../source/a.css'
  )
})

test('generates inline map', () => {
  let css = 'a { }'

  let inline = postcss([() => {}]).process(css, {
    from: 'a.css',
    map: { inline: true },
    to: 'b.css'
  })

  type(inline.map, 'undefined')
  match(inline.css, /# sourceMappingURL=data:/)

  let separated = postcss([() => {}]).process(css, {
    from: 'a.css',
    map: { inline: false },
    to: 'b.css'
  })

  let base64 = Buffer.from(separated.map.toString()).toString('base64')
  let end = inline.css.slice(-base64.length - 3)
  is(end, base64 + ' */')
})

test('generates inline map by default', () => {
  let inline = postcss([() => {}]).process('a { }', {
    from: 'a.css',
    map: true,
    to: 'b.css'
  })
  match(inline.css, /# sourceMappingURL=data:/)
})

test('generates separated map if previous map was not inlined', () => {
  let step1 = doubler.process('a { color: black }', {
    from: 'a.css',
    map: { inline: false },
    to: 'b.css'
  })
  let step2 = lighter.process(step1.css, {
    from: 'b.css',
    map: { prev: step1.map },
    to: 'c.css'
  })

  type(step2.map, 'object')
})

test('generates separated map on annotation option', () => {
  let result = postcss([() => {}]).process('a { }', {
    from: 'a.css',
    map: { annotation: false },
    to: 'b.css'
  })

  type(result.map, 'object')
})

test('allows change map type', () => {
  let step1 = postcss([() => {}]).process('a { }', {
    from: 'a.css',
    map: { inline: true },
    to: 'b.css'
  })

  let step2 = postcss([() => {}]).process(step1.css, {
    from: 'b.css',
    map: { inline: false },
    to: 'c.css'
  })

  type(step2.map, 'object')
  match(step2.css, /# sourceMappingURL=c\.css\.map/)
})

test('misses check files on requires', () => {
  mkdirSync(dir)
  let file = join(dir, 'a.css')

  let step1 = doubler.process('a { }', {
    from: 'a.css',
    map: { inline: false },
    to: file
  })

  writeFileSync(file + '.map', step1.map.toString())
  let step2 = lighter.process(step1.css, {
    from: file,
    map: false,
    to: 'b.css'
  })

  type(step2.map, 'undefined')
})

test('works in subdirs', () => {
  let result = doubler.process('a { }', {
    from: 'from/a.css',
    map: { inline: false },
    to: 'out/b.css'
  })

  match(result.css, /sourceMappingURL=b.css.map/)

  let map = consumer(result.map)
  is(map.file, 'b.css')
  equal(map.sources, ['../from/a.css'])
})

test('uses map from subdir', () => {
  let step1 = doubler.process('a { }', {
    from: 'a.css',
    map: { inline: false },
    to: 'out/b.css'
  })

  let step2 = doubler.process(step1.css, {
    from: 'out/b.css',
    map: { prev: step1.map },
    to: 'out/two/c.css'
  })

  let source = consumer(step2.map).originalPositionFor({
    column: 0,
    line: 1
  }).source
  is(source, '../../a.css')

  let step3 = doubler.process(step2.css, {
    from: 'c.css',
    map: { prev: step2.map },
    to: 'd.css'
  })

  source = consumer(step3.map).originalPositionFor({
    column: 0,
    line: 1
  }).source
  is(source, '../../a.css')
})

test('uses map from subdir if it inlined', () => {
  let step1 = doubler.process('a { }', {
    from: 'a.css',
    map: true,
    to: 'out/b.css'
  })

  let step2 = doubler.process(step1.css, {
    from: 'out/b.css',
    map: { inline: false },
    to: 'out/two/c.css'
  })

  let source = consumer(step2.map).originalPositionFor({
    column: 0,
    line: 1
  }).source
  is(source, '../../a.css')
})

test('uses map from subdir if it written as a file', () => {
  let step1 = doubler.process('a { }', {
    from: 'source/a.css',
    map: { annotation: 'maps/b.css.map', inline: false },
    to: 'one/b.css'
  })

  let source = consumer(step1.map).originalPositionFor({
    column: 0,
    line: 1
  }).source
  is(source, '../../source/a.css')

  let file = join(dir, 'one', 'maps', 'b.css.map')
  mkdirSync(dir)
  mkdirSync(join(dir, 'one'))
  mkdirSync(join(dir, 'one', 'maps'))
  writeFileSync(file, step1.map.toString())

  let step2 = doubler.process(step1.css, {
    from: join(dir, 'one', 'b.css'),
    map: true,
    to: join(dir, 'two', 'c.css')
  })

  source = consumer(step2.map).originalPositionFor({
    column: 0,
    line: 1
  }).source
  is(source, '../source/a.css')
})

test('works with different types of maps', () => {
  let step1 = doubler.process('a { }', {
    from: 'a.css',
    map: { inline: false },
    to: 'b.css'
  })

  let map = step1.map
  let maps = [map, consumer(map), map.toJSON(), map.toString()]

  for (let i of maps) {
    let step2 = doubler.process(step1.css, {
      from: 'b.css',
      map: { prev: i },
      to: 'c.css'
    })
    let source = consumer(step2.map).originalPositionFor({
      column: 0,
      line: 1
    }).source
    is(source, 'a.css')
  }
})

test('sets source content by default', () => {
  let result = doubler.process('a { }', {
    from: 'a.css',
    map: true,
    to: 'out/b.css'
  })

  is(read(result).sourceContentFor('../a.css'), 'a { }')
})

test('misses source content on request', () => {
  let result = doubler.process('a { }', {
    from: 'a.css',
    map: { sourcesContent: false },
    to: 'out/b.css'
  })

  is(read(result).sourceContentFor('../a.css'), null)
})

test('misses source content if previous not have', () => {
  let step1 = doubler.process('a { }', {
    from: 'a.css',
    map: { sourcesContent: false },
    to: 'out/a.css'
  })

  let file1 = postcss.parse(step1.css, {
    from: 'a.css',
    map: { prev: step1.map }
  })
  let file2 = postcss.parse('b { }', { from: 'b.css', map: true })

  if (file1.first) file2.append(file1.first.clone())
  let step2 = file2.toResult({ map: true, to: 'c.css' })

  is(read(step2).sourceContentFor('b.css'), null)
})

test('misses source content on request in multiple steps', () => {
  let step1 = doubler.process('a { }', {
    from: 'a.css',
    map: { sourcesContent: true },
    to: 'out/a.css'
  })

  let file1 = postcss.parse(step1.css, {
    from: 'a.css',
    map: { prev: step1.map }
  })
  let file2 = postcss.parse('b { }', { from: 'b.css', map: true })

  if (file1.first) file2.append(file1.first.clone())
  let step2 = file2.toResult({
    map: { sourcesContent: false },
    to: 'c.css'
  })

  let map = read(step2)
  is(map.sourceContentFor('b.css'), null)
  is(map.sourceContentFor('../a.css'), null)
})

test('detects input file name from map', () => {
  let one = doubler.process('a { }', { map: true, to: 'a.css' })
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
    map: true,
    to: 'шаг1.css'
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
  equal(map.originalPositionFor({ column: 5, line: 2 }), {
    column: 0,
    line: 1,
    name: null,
    source: '<no source>'
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
    map: { inline: false },
    to: 'b.css'
  })

  is(result.css, 'a { }\n/*# sourceMappingURL=b.css.map */')
})

test('does not update annotation on request', () => {
  let css = 'a { }/*# sourceMappingURL=a.css.map */'
  let result = postcss([() => {}]).process(css, {
    from: 'a.css',
    map: { annotation: false, inline: false },
    to: 'b.css'
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
      from: 'file:///dir/a.css',
      inline: false
    }
  })
  equal(result.map.toJSON().sources, ['file:///dir/a.css'])
})

test('preserves absolute urls in `to`', () => {
  let result = postcss([() => {}]).process('a{}', {
    from: '/dir/to/a.css',
    map: { inline: false },
    to: 'http://example.com/a.css'
  })
  is(result.map.toJSON().file, 'http://example.com/a.css')
})

test('preserves absolute urls in sources', () => {
  let result = postcss([() => {}]).process('a{}', {
    from: 'file:///dir/a.css',
    map: { inline: false },
    to: 'http://example.com/a.css'
  })
  equal(result.map.toJSON().sources, ['file:///dir/a.css'])
})

test('uses absolute path on request', () => {
  let result = postcss([() => {}]).process('a{}', {
    from: '/dir/a.css',
    map: { absolute: true, inline: false },
    to: '/dir/b.css'
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
    map: true,
    to: 'http://example.com/b.css'
  })
  let result2 = postcss([() => {}]).process(result1.css, {
    map: {
      inline: false
    },
    to: 'http://example.com/c.css'
  })
  is(result2.root.source?.input.file, 'http://example.com/b.css')
  equal(result2.map.toJSON().sources, ['http://example.com/a.css'])
})

test('allows dynamic annotations', () => {
  let result = postcss([() => {}]).process('a{}', {
    map: {
      annotation(to, root) {
        let rule = root.first as Rule
        return to + '-' + rule.selector + '.map'
      }
    },
    to: 'out.css'
  })
  is(result.css, 'a{}\n/*# sourceMappingURL=out.css-a.map */')
})

test('uses URLs in sources', () => {
  let result = postcss([() => {}]).process('a{}', {
    from: 'a b.css',
    map: { inline: false },
    to: 'dir/b.css'
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
    map: { inline: false },
    to: 'b.css'
  })

  equal(result.map.toJSON().sources, ['a.css'])
})

test('generates map object with empty processor', () => {
  let result = postcss().process('a {} /*hello world*/', {
    from: 'a.css',
    map: true,
    to: 'b.css'
  })

  let map = read(result)

  equal(map.originalPositionFor({ column: 0, line: 1 }), {
    column: 0,
    line: 1,
    name: null,
    source: 'a.css'
  })
})

test('supports previous map with empty processor', () => {
  let result1 = postcss().process('a{}', {
    from: '/a.css',
    map: {
      inline: false,
      sourcesContent: true
    },
    to: '/b.css'
  })
  equal(result1.map.toJSON(), {
    file: 'b.css',
    mappings: 'AAAA',
    names: [],
    sources: ['a.css'],
    sourcesContent: ['a{}'],
    version: 3
  })

  let result2 = postcss().process(result1.css, {
    from: '/b.css',
    map: {
      prev: result1.map
    },
    to: '/c.css'
  })
  equal(result2.map.toJSON().sources, ['a.css'])
  equal(result2.map.toJSON().sourcesContent, ['a{}'])
})

test('supports previous inline map with empty processor', () => {
  let result1 = postcss().process('a{}', {
    from: '/a.css',
    map: true,
    to: '/b.css'
  })
  let result2 = postcss().process(result1.css, {
    from: '/b.css',
    to: '/c.css'
  })
  let root3 = postcss.parse(result2.css, { from: '/c.css' })
  match((root3.source?.input.origin(1, 0) as any).file, 'a.css')
})

test('absolute sourcemaps have source contents', () => {
  let result = postcss([() => {}]).process('a{}', {
    from: '/dir/to/a.css',
    map: {
      absolute: true,
      inline: false
    }
  })
  equal(result.map.toJSON().sources, [
    pathToFileURL('/dir/to/a.css').toString()
  ])
  equal(result.map.toJSON().sourcesContent, ['a{}'])
})

test.run()
