import { test } from 'uvu'
import { is, equal } from 'uvu/assert'

import postcss, { Warning, Result, Root, Plugin } from '../lib/postcss.js'
import Processor from '../lib/processor.js'

let processor = new Processor()
let root = new Root()

test('stringifies', () => {
  let result = new Result(processor, root, {})
  result.css = 'a{}'
  is(`${result}`, result.css)
})

test('adds warning', () => {
  let warning
  let plugin: Plugin = {
    postcssPlugin: 'test-plugin',
    Once(css, { result }) {
      warning = result.warn('test', { node: css.first })
    }
  }
  let result = postcss([plugin]).process('a{}').sync()

  equal(
    warning,
    new Warning('test', {
      plugin: 'test-plugin',
      node: result.root.first
    })
  )

  equal(result.messages, [warning])
})

test('allows to override plugin', () => {
  let plugin: Plugin = {
    postcssPlugin: 'test-plugin',
    Once(css, { result }) {
      result.warn('test', { plugin: 'test-plugin#one' })
    }
  }
  let result = postcss([plugin]).process('a{}').sync()

  is(result.messages[0].plugin, 'test-plugin#one')
})

test('allows Root', () => {
  let css = postcss.parse('a{}')
  let result = new Result(processor, css, {})
  result.warn('TT', { node: css.first })

  is(result.messages[0].toString(), '<css input>:1:1: TT')
})

test('returns only warnings', () => {
  let result = new Result(processor, root, {})
  result.messages = [
    { type: 'warning', text: 'a' },
    { type: 'custom' },
    { type: 'warning', text: 'b' }
  ]
  equal(result.warnings(), [
    { type: 'warning', text: 'a' },
    { type: 'warning', text: 'b' }
  ])
})

test.run()
