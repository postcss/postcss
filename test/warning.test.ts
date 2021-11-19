import { resolve } from 'path'

import { Warning, parse, decl } from '../lib/postcss.js'

it('outputs simple warning', () => {
  let warning = new Warning('text')
  expect(warning.toString()).toBe('text')
})

it('outputs warning with plugin', () => {
  let warning = new Warning('text', { plugin: 'plugin' })
  expect(warning.toString()).toBe('plugin: text')
})

it('outputs warning with position', () => {
  let root = parse('a{}')
  let warning = new Warning('text', { node: root.first })
  expect(warning.toString()).toBe('<css input>:1:1: text')
})

it('outputs warning with plugin and node', () => {
  let file = resolve('a.css')
  let root = parse('a{}', { from: file })
  let warning = new Warning('text', {
    plugin: 'plugin',
    node: root.first
  })
  expect(warning.toString()).toEqual(`plugin: ${file}:1:1: text`)
})

it('outputs warning with index', () => {
  let file = resolve('a.css')
  let root = parse('@rule param {}', { from: file })
  let warning = new Warning('text', {
    plugin: 'plugin',
    node: root.first,
    index: 7
  })
  expect(warning.toString()).toEqual(`plugin: ${file}:1:8: text`)
})

it('outputs warning with word', () => {
  let file = resolve('a.css')
  let root = parse('@rule param {}', { from: file })
  let warning = new Warning('text', {
    plugin: 'plugin',
    node: root.first,
    word: 'am'
  })
  expect(warning.toString()).toEqual(`plugin: ${file}:1:10: text`)
})

it('generates warning without source', () => {
  let node = decl({ prop: 'color', value: 'black' })
  let warning = new Warning('text', { node })
  expect(warning.toString()).toBe('<css input>: text')
})

it('has line and column is undefined by default', () => {
  let warning = new Warning('text')
  expect(warning.line).toBeUndefined()
  expect(warning.column).toBeUndefined()
  expect(warning.endLine).toBeUndefined()
  expect(warning.endColumn).toBeUndefined()
})

it('gets range from node', () => {
  let root = parse('a{}')
  let warning = new Warning('text', { node: root.first })
  expect(warning.line).toBe(1)
  expect(warning.column).toBe(1)
  expect(warning.endLine).toBe(1)
  expect(warning.endColumn).toBe(4)
})

it('gets range from node without end', () => {
  let root = parse('a{}')
  root.first!.source!.end = undefined
  let warning = new Warning('text', { node: root.first })
  expect(warning.line).toBe(1)
  expect(warning.column).toBe(1)
  expect(warning.endLine).toBe(1)
  expect(warning.endColumn).toBe(2)
})

it('gets range from word', () => {
  let root = parse('a b{}')
  let warning = new Warning('text', { node: root.first, word: 'b' })
  expect(warning.line).toBe(1)
  expect(warning.column).toBe(3)
  expect(warning.endLine).toBe(1)
  expect(warning.endColumn).toBe(4)
})

it('gets range from index', () => {
  let root = parse('a b{}')
  let warning = new Warning('text', { node: root.first, index: 2 })
  expect(warning.line).toBe(1)
  expect(warning.column).toBe(3)
  expect(warning.endLine).toBe(1)
  expect(warning.endColumn).toBe(4)
})

it('gets range from index and endIndex', () => {
  let root = parse('a b{}')
  let warning = new Warning('text', { node: root.first, index: 2, endIndex: 3 })
  expect(warning.line).toBe(1)
  expect(warning.column).toBe(3)
  expect(warning.endLine).toBe(1)
  expect(warning.endColumn).toBe(4)
})

it('gets range from start', () => {
  let root = parse('a b{}')
  let warning = new Warning('text', {
    node: root.first,
    start: { line: 1, column: 3 }
  })
  expect(warning.line).toBe(1)
  expect(warning.column).toBe(3)
  expect(warning.endLine).toBe(1)
  expect(warning.endColumn).toBe(6)
})

it('gets range from end', () => {
  let root = parse('a b{}')
  let warning = new Warning('text', {
    node: root.first,
    end: { line: 1, column: 3 }
  })
  expect(warning.line).toBe(1)
  expect(warning.column).toBe(1)
  expect(warning.endLine).toBe(1)
  expect(warning.endColumn).toBe(3)
})

it('gets range from start and end', () => {
  let root = parse('a b{}')
  let warning = new Warning('text', {
    node: root.first,
    start: { line: 1, column: 3 },
    end: { line: 1, column: 4 }
  })
  expect(warning.line).toBe(1)
  expect(warning.column).toBe(3)
  expect(warning.endLine).toBe(1)
  expect(warning.endColumn).toBe(4)
})

it('always returns exclusive ends', () => {
  let root = parse('a b{}')
  let warning = new Warning('text', { node: root.first, index: 1, endIndex: 1 })
  expect(warning.line).toBe(1)
  expect(warning.column).toBe(2)
  expect(warning.endLine).toBe(1)
  expect(warning.endColumn).toBe(3)
})

it('always returns valid ranges', () => {
  let root = parse('a b{}')
  let warning = new Warning('text', { node: root.first, index: 2, endIndex: 1 })
  expect(warning.line).toBe(1)
  expect(warning.column).toBe(3)
  expect(warning.endLine).toBe(1)
  expect(warning.endColumn).toBe(4)
})
