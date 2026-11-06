import { join, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { SourceNode } from 'source-map-js'
import { test } from 'uvu'
import { equal, is, match, throws } from 'uvu/assert'

import { fromJSON, Input, Root } from '../lib/postcss.js'

function urlOf(file: string): string {
  return pathToFileURL(join(__dirname, file)).toString()
}

test('delays CSS generation until the source is needed', () => {
  let calls = 0
  let input = new Input(
    () => {
      calls += 1
      return 'a {}'
    },
    { from: 'a.css' }
  )

  is(calls, 0)
  is(input.from, resolve('a.css'))
  is(input.from, resolve('a.css'))
  is(calls, 0)
  is(input.css, 'a {}')
  is(input.css, 'a {}')
  is(input.document, 'a {}')
  is(input.hasBOM, false)
  is(input.map, undefined)
  is(calls, 1)
  equal(
    Object.keys(input).sort(),
    Object.keys(new Input('a {}', { from: 'a.css' })).sort()
  )
  is(Object.getOwnPropertyDescriptor(input, 'css')?.writable, true)
})

test('keeps lazy file paths without generating CSS', () => {
  for (let from of [resolve('a.css'), 'https://example.com/a.css']) {
    let input = new Input(
      () => {
        throw new Error('CSS should not be needed')
      },
      { from }
    )
    is(input.file, from)
    is(input.from, from)
  }
})

test('processes a lazy BOM before reading the document', () => {
  for (let bom of ['\uFEFF', '\uFFFE']) {
    let input = new Input(() => bom + 'a {}')
    is(input.document, 'a {}')
    is(input.css, 'a {}')
    is(input.hasBOM, true)
  }
  let input = new Input(() => '\uFEFFa {}', { document: '<style>a {}</style>' })
  is(input.document, '<style>a {}</style>')
  is(input.css, 'a {}')
})

test('loads lazy source maps and infers the source file', () => {
  let map = JSON.stringify({
    file: 'a.css',
    mappings: '',
    names: [],
    sources: [],
    version: 3
  })
  let calls = 0
  let input = new Input(() => {
    calls += 1
    return (
      'a {}\n/*# sourceMappingURL=data:application/json,' +
      encodeURIComponent(map) +
      ' */'
    )
  })
  is(calls, 0)
  is(input.from, resolve('a.css'))
  is(input.map.text, map)
  is(input.map.file, input.from)
  is(calls, 1)

  let explicit = new Input(() => 'a {}', {
    from: 'b.css',
    map: { prev: map }
  })
  is(explicit.map.text, map)
  is(explicit.map.file, resolve('b.css'))
  is(explicit.from, resolve('b.css'))
})

test('assigns a stable ID to a lazy input without a file', () => {
  let calls = 0
  let input = new Input(() => {
    calls += 1
    return 'a {}'
  })
  is(calls, 0)
  match(input.from, /^<input css [\w-]+>$/)
  is(input.id, input.from)
  is(calls, 1)
})

test('keeps lazy source properties writable', () => {
  for (let name of ['css', 'document', 'hasBOM', 'map'] as const) {
    let input = new Input(() => 'a {}', { from: 'a.css' })
    let values = { css: 'b {}', document: 'b {}', hasBOM: true, map: undefined }
    let value = values[name]
    ;(input as any)[name] = value
    is(input[name], value)
    is(Object.getOwnPropertyDescriptor(input, name)?.writable, true)
  }
  let input = new Input(() => 'a {}', { from: 'a.css' })
  input.file = 'b.css'
  is(input.css, 'a {}')
  is(input.from, 'b.css')

  let unnamed = new Input(() => 'a {}')
  unnamed.file = 'b.css'
  is(unnamed.css, 'a {}')
  is(unnamed.from, 'b.css')
})

test('retries lazy source generation after a failure', () => {
  let calls = 0
  let input = new Input(() => {
    calls += 1
    if (calls === 1) throw new Error('Not ready')
    return 'a {}'
  })
  throws(() => input.css, /Not ready/)
  is(input.css, 'a {}')
  is(input.css, 'a {}')
  is(calls, 2)

  let assigned = new Input(() => {
    calls += 1
    if (calls === 3) throw new Error('Not ready')
    return 'a {}'
  })
  throws(() => {
    assigned.css = 'b {}'
  }, /Not ready/)
  assigned.css = 'b {}'
  is(assigned.css, 'b {}')
  is(calls, 4)
})

test('caches an empty lazy source', () => {
  let calls = 0
  let input = new Input(() => {
    calls += 1
    return ''
  })
  is(input.hasBOM, false)
  is(input.css, '')
  is(input.document, '')
  is(calls, 1)
})

test('keeps stringifiable inputs eager', () => {
  let calls = 0
  let css = {
    toString() {
      calls += 1
      return '\uFEFFa {}'
    }
  }
  // @ts-expect-error Stringifiable objects are supported by the JS API
  let input = new Input(css)
  is(calls, 1)
  is(input.css, 'a {}')
  is(input.document, 'a {}')
  is(input.hasBOM, true)
  is(Object.getOwnPropertyDescriptor(input, 'css')?.writable, true)
})

test('serializes and hydrates lazy inputs', () => {
  let input = new Input(() => '\uFEFFa {}', { from: 'a.css' })
  let root = new Root({ source: { input } })
  let json = root.toJSON()
  equal(input.toJSON(), new Input('\uFEFFa {}', { from: 'a.css' }).toJSON())
  let hydrated = fromJSON(json).source!.input
  is(hydrated.css, 'a {}')
  is(hydrated.hasBOM, true)
  is(hydrated.from, resolve('a.css'))
})

test('uses lazy CSS to locate errors', () => {
  let input = new Input(() => 'a {\n}')
  let error = input.error('Test error', 4)
  is(error.line, 2)
  is(error.column, 1)
  is(error.source, 'a {\n}')
  is(error.input?.offset, 4)
  is(input.fromLineAndColumn(2, 1), 4)
})

test('uses lazy source maps to locate errors in the original source', () => {
  let node = new SourceNode(3, 5, 'a.scss', 'a {}')
  node.setSourceContent('a.scss', '\n\n     a {}')
  let from = join(__dirname, 'a.css')
  let { code, map } = node.toStringWithSourceMap({ file: from })
  let input = new Input(() => code, { from, map: { prev: map } })
  let error = input.error('Test error', 1, 1)
  is(error.file, join(__dirname, 'a.scss'))
  is(error.line, 3)
  is(error.column, 6)
  is(error.source, '\n\n     a {}')
  is(error.input?.source, 'a {}')
})

test('fromLineAndColumn() returns offset', () => {
  let input = new Input('a {\n}')
  is(input.fromLineAndColumn(1, 1), 0)
  is(input.fromLineAndColumn(1, 3), 2)
  is(input.fromLineAndColumn(2, 1), 4)
  is(input.fromLineAndColumn(2, 2), 5)
})

test('fromOffset() returns line and column', () => {
  let input = new Input('a {\n}')
  equal(input.fromOffset(0), { col: 1, line: 1 })
  equal(input.fromOffset(2), { col: 3, line: 1 })
  equal(input.fromOffset(4), { col: 1, line: 2 })
  equal(input.fromOffset(5), { col: 2, line: 2 })
})

test('origin() returns false without source map', () => {
  let input = new Input('a {\n}')
  is(input.origin(1, 1), false)
})

test('origin() returns source position with source map', () => {
  // @ts-expect-error source-map-js accepts null, but it's not in the types
  let node = new SourceNode(null, null, null, [
    new SourceNode(1, 0, 'a.css', 'a'),
    new SourceNode(1, 1, 'a.css', ' '),
    new SourceNode(1, 2, 'a.css', '{'),
    new SourceNode(1, 3, 'a.css', '}'),
    '\n',
    new SourceNode(1, 0, 'b.css', 'b'),
    new SourceNode(1, 1, 'b.css', ' '),
    new SourceNode(1, 2, 'b.css', '{'),
    new SourceNode(1, 3, 'b.css', '}'),
    new SourceNode(1, 4, 'b.css', '\n'),
    new SourceNode(2, 0, 'b.css', 'c'),
    new SourceNode(2, 1, 'b.css', ' '),
    new SourceNode(2, 2, 'b.css', '{'),
    new SourceNode(2, 3, 'b.css', '}')
  ])
  let from = join(__dirname, 'all.css')
  let codeWithSourceMap = node.toStringWithSourceMap({ file: from })
  let input = new Input(codeWithSourceMap.code, {
    from,
    map: { prev: codeWithSourceMap.map }
  })
  equal(input.origin(1, 1), {
    column: 1,
    endColumn: undefined,
    endLine: undefined,
    file: join(__dirname, 'a.css'),
    line: 1,
    url: urlOf('a.css')
  })
  equal(input.origin(1, 4), {
    column: 4,
    endColumn: undefined,
    endLine: undefined,
    file: join(__dirname, 'a.css'),
    line: 1,
    url: urlOf('a.css')
  })
  equal(input.origin(2, 1), {
    column: 1,
    endColumn: undefined,
    endLine: undefined,
    file: join(__dirname, 'b.css'),
    line: 1,
    url: urlOf('b.css')
  })
  equal(input.origin(2, 4), {
    column: 4,
    endColumn: undefined,
    endLine: undefined,
    file: join(__dirname, 'b.css'),
    line: 1,
    url: urlOf('b.css')
  })
  equal(input.origin(3, 1), {
    column: 1,
    endColumn: undefined,
    endLine: undefined,
    file: join(__dirname, 'b.css'),
    line: 2,
    url: urlOf('b.css')
  })
  equal(input.origin(2, 1, 2, 4), {
    column: 1,
    endColumn: 4,
    endLine: 1,
    file: join(__dirname, 'b.css'),
    line: 1,
    url: urlOf('b.css')
  })
})

test('origin() does not mix undefined and null when end position is unmapped', () => {
  // @ts-expect-error source-map-js accepts null, but it's not in the types
  let node = new SourceNode(null, null, null, [
    new SourceNode(1, 0, 'a.css', 'a'),
    new SourceNode(1, 1, 'a.css', ' '),
    new SourceNode(1, 2, 'a.css', '{'),
    new SourceNode(1, 3, 'a.css', '}')
  ])
  let from = join(__dirname, 'all.css')
  let codeWithSourceMap = node.toStringWithSourceMap({ file: from })
  let input = new Input(codeWithSourceMap.code, {
    from,
    map: { prev: codeWithSourceMap.map }
  })

  // The start position (1, 1) is mapped, but the requested end position
  // (99, 1) is far beyond anything the source map covers, so
  // `originalPositionFor()` cannot resolve it.
  equal(input.origin(1, 1, 99, 1), {
    column: 1,
    endColumn: undefined,
    endLine: undefined,
    file: join(__dirname, 'a.css'),
    line: 1,
    url: urlOf('a.css')
  })
})

test.run()
