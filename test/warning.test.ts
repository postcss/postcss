import { resolve } from 'path'
import { test } from 'uvu'
import { is, type } from 'uvu/assert'

import { decl, parse, Warning } from '../lib/postcss.js'

test('outputs simple warning', () => {
  let warning = new Warning('text')
  is(warning.toString(), 'text')
})

test('outputs warning with plugin', () => {
  let warning = new Warning('text', { plugin: 'plugin' })
  is(warning.toString(), 'plugin: text')
})

test('outputs warning with position', () => {
  let root = parse('a{}')
  let warning = new Warning('text', { node: root.first })
  is(warning.toString(), '<css input>:1:1: text')
})

test('outputs warning with plugin and node', () => {
  let file = resolve('a.css')
  let root = parse('a{}', { from: file })
  let warning = new Warning('text', {
    node: root.first,
    plugin: 'plugin'
  })
  is(warning.toString(), `plugin: ${file}:1:1: text`)
})

test('outputs warning with index', () => {
  let file = resolve('a.css')
  let root = parse('@rule param {}', { from: file })
  let warning = new Warning('text', {
    index: 7,
    node: root.first,
    plugin: 'plugin'
  })
  is(warning.toString(), `plugin: ${file}:1:8: text`)
})

test('outputs warning with word', () => {
  let file = resolve('a.css')
  let root = parse('@rule param {}', { from: file })
  let warning = new Warning('text', {
    node: root.first,
    plugin: 'plugin',
    word: 'am'
  })
  is(warning.toString(), `plugin: ${file}:1:10: text`)
})

test('generates warning without source', () => {
  let node = decl({ prop: 'color', value: 'black' })
  let warning = new Warning('text', { node })
  is(warning.toString(), '<css input>: text')
})

test('has line and column is undefined by default', () => {
  let warning = new Warning('text')
  type(warning.line, 'undefined')
  type(warning.column, 'undefined')
  type(warning.endLine, 'undefined')
  type(warning.endColumn, 'undefined')
})

test('gets range from node', () => {
  let root = parse('a{}')
  let warning = new Warning('text', { node: root.first })
  is(warning.line, 1)
  is(warning.column, 1)
  is(warning.endLine, 1)
  is(warning.endColumn, 4)
})

test('gets range from node without end', () => {
  let root = parse('a{}')
  root.first!.source!.end = undefined
  let warning = new Warning('text', { node: root.first })
  is(warning.line, 1)
  is(warning.column, 1)
  is(warning.endLine, 1)
  is(warning.endColumn, 2)
})

test('gets range from node with endIndex 3', () => {
  let root = parse('a{}')
  let warning = new Warning('text', { node: root.first, index: 0, endIndex: 3 })
  is(warning.line, 1)
  is(warning.column, 1)
  is(warning.endLine, 1)
  is(warning.endColumn, 4)
})

test('gets range from node with endIndex 0', () => {
  let root = parse('a{}')
  let warning = new Warning('text', { node: root.first, index: 0, endIndex: 0 })
  is(warning.line, 1)
  is(warning.column, 1)
  is(warning.endLine, 1)
  is(warning.endColumn, 2)
})

test('gets range from word', () => {
  let root = parse('a b{}')
  let warning = new Warning('text', { node: root.first, word: 'b' })
  is(warning.line, 1)
  is(warning.column, 3)
  is(warning.endLine, 1)
  is(warning.endColumn, 4)
})

test('gets range from index', () => {
  let root = parse('a b{}')
  let warning = new Warning('text', { index: 2, node: root.first })
  is(warning.line, 1)
  is(warning.column, 3)
  is(warning.endLine, 1)
  is(warning.endColumn, 4)
})

test('gets range from index and endIndex', () => {
  let root = parse('a b{}')
  let warning = new Warning('text', { endIndex: 3, index: 2, node: root.first })
  is(warning.line, 1)
  is(warning.column, 3)
  is(warning.endLine, 1)
  is(warning.endColumn, 4)
})

test('gets range from start', () => {
  let root = parse('a b{}')
  let warning = new Warning('text', {
    node: root.first,
    start: { column: 3, line: 1 }
  })
  is(warning.line, 1)
  is(warning.column, 3)
  is(warning.endLine, 1)
  is(warning.endColumn, 6)
})

test('gets range from end', () => {
  let root = parse('a b{}')
  let warning = new Warning('text', {
    end: { column: 3, line: 1 },
    node: root.first
  })
  is(warning.line, 1)
  is(warning.column, 1)
  is(warning.endLine, 1)
  is(warning.endColumn, 3)
})

test('gets range from start and end', () => {
  let root = parse('a b{}')
  let warning = new Warning('text', {
    end: { column: 4, line: 1 },
    node: root.first,
    start: { column: 3, line: 1 }
  })
  is(warning.line, 1)
  is(warning.column, 3)
  is(warning.endLine, 1)
  is(warning.endColumn, 4)
})

test('always returns exclusive ends', () => {
  let root = parse('a b{}')
  let warning = new Warning('text', { endIndex: 1, index: 1, node: root.first })
  is(warning.line, 1)
  is(warning.column, 2)
  is(warning.endLine, 1)
  is(warning.endColumn, 3)
})

test('always returns valid ranges', () => {
  let root = parse('a b{}')
  let warning = new Warning('text', { endIndex: 1, index: 2, node: root.first })
  is(warning.line, 1)
  is(warning.column, 3)
  is(warning.endLine, 1)
  is(warning.endColumn, 4)
})

test.run()
