const Declaration = require('../lib/declaration')
const Warning = require('../lib/warning')
const parse = require('../lib/parse')

const path = require('path')

it('outputs simple warning', () => {
  const warning = new Warning('text')
  expect(warning.toString()).toEqual('text')
})

it('outputs warning with plugin', () => {
  const warning = new Warning('text', { plugin: 'plugin' })
  expect(warning.toString()).toEqual('plugin: text')
})

it('outputs warning with position', () => {
  const root = parse('a{}')
  const warning = new Warning('text', { node: root.first })
  expect(warning.toString()).toEqual('<css input>:1:1: text')
})

it('outputs warning with plugin and node', () => {
  const file = path.resolve('a.css')
  const root = parse('a{}', { from: file })
  const warning = new Warning('text', {
    plugin: 'plugin',
    node: root.first
  })
  expect(warning.toString()).toEqual(`plugin: ${ file }:1:1: text`)
})

it('outputs warning with index', () => {
  const file = path.resolve('a.css')
  const root = parse('@rule param {}', { from: file })
  const warning = new Warning('text', {
    plugin: 'plugin',
    node: root.first,
    index: 7
  })
  expect(warning.toString()).toEqual(`plugin: ${ file }:1:8: text`)
})

it('outputs warning with word', () => {
  const file = path.resolve('a.css')
  const root = parse('@rule param {}', { from: file })
  const warning = new Warning('text', {
    plugin: 'plugin',
    node: root.first,
    word: 'am'
  })
  expect(warning.toString()).toEqual(`plugin: ${ file }:1:10: text`)
})

it('generates warning without source', () => {
  const decl = new Declaration({ prop: 'color', value: 'black' })
  const warning = new Warning('text', { node: decl })
  expect(warning.toString()).toEqual('<css input>: text')
})

it('has line and column is undefined by default', () => {
  const warning = new Warning('text')
  expect(warning.line).not.toBeDefined()
  expect(warning.column).not.toBeDefined()
})

it('gets position from node', () => {
  const root = parse('a{}')
  const warning = new Warning('text', { node: root.first })
  expect(warning.line).toEqual(1)
  expect(warning.column).toEqual(1)
})

it('gets position from word', () => {
  const root = parse('a b{}')
  const warning = new Warning('text', { node: root.first, word: 'b' })
  expect(warning.line).toEqual(1)
  expect(warning.column).toEqual(3)
})

it('gets position from index', () => {
  const root = parse('a b{}')
  const warning = new Warning('text', { node: root.first, index: 2 })
  expect(warning.line).toEqual(1)
  expect(warning.column).toEqual(3)
})
