import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { SourceNode } from 'source-map-js'
import { test } from 'uvu'
import { equal, is } from 'uvu/assert'

import { Input } from '../lib/postcss.js'

function urlOf(file: string): string {
  return pathToFileURL(join(__dirname, file)).toString()
}

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
  // @ts-expect-error source-map-js accepts null, but it's not in the types (ref: https://github.com/7rulnik/source-map-js/blob/428d49f6b1e1614f082b7706fa879a3d9c64f728/test/test-source-node.js#L20)
  let node = new SourceNode(null, null, null, [
    new SourceNode(1, 0, "a.css", "a"),
    new SourceNode(1, 1, "a.css", " "),
    new SourceNode(1, 2, "a.css", "{"),
    new SourceNode(1, 3, "a.css", "}"),
    '\n',
    new SourceNode(1, 0, "b.css", "b"),
    new SourceNode(1, 1, "b.css", " "),
    new SourceNode(1, 2, "b.css", "{"),
    new SourceNode(1, 3, "b.css", "}"),
    new SourceNode(1, 4, "b.css", "\n"),
    new SourceNode(2, 0, "b.css", "c"),
    new SourceNode(2, 1, "b.css", " "),
    new SourceNode(2, 2, "b.css", "{"),
    new SourceNode(2, 3, "b.css", "}"),
  ]);
  let from = join(__dirname, 'all.css')
  let codeWithSourceMap = node.toStringWithSourceMap({ file: from })
  let input = new Input(
    codeWithSourceMap.code,
    { from, map: { prev: codeWithSourceMap.map } }
  )
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

test.run()
