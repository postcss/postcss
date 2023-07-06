import { test } from 'uvu'
import { equal, is } from 'uvu/assert'

import postcss, { Plugin, Result, Root, Warning } from '../lib/postcss.js'
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
    Once(css, { result }) {
      warning = result.warn('test', { node: css.first })
    },
    postcssPlugin: 'test-plugin'
  }
  let result = postcss([plugin]).process('a{}').sync()

  equal(
    warning,
    new Warning('test', {
      node: result.root.first,
      plugin: 'test-plugin'
    })
  )

  equal(result.messages, [warning])
})

test('allows to override plugin', () => {
  let plugin: Plugin = {
    Once(css, { result }) {
      result.warn('test', { plugin: 'test-plugin#one' })
    },
    postcssPlugin: 'test-plugin'
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
    { text: 'a', type: 'warning' },
    { type: 'custom' },
    { text: 'b', type: 'warning' }
  ]
  equal(result.warnings(), [
    { text: 'a', type: 'warning' },
    { text: 'b', type: 'warning' }
  ])
})

test.run()
