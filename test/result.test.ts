import postcss, { Warning, Result, Root, Plugin } from '../lib/postcss.js'
import Processor from '../lib/processor.js'

let processor = new Processor()
let root = new Root()

it('stringifies', () => {
  let result = new Result(processor, root, {})
  result.css = 'a{}'
  expect(`${result}`).toEqual(result.css)
})

it('adds warning', () => {
  let warning
  let plugin: Plugin = {
    postcssPlugin: 'test-plugin',
    Once(css, { result }) {
      warning = result.warn('test', { node: css.first })
    }
  }
  let result = postcss([plugin]).process('a{}').sync()

  expect(warning).toEqual(
    new Warning('test', {
      plugin: 'test-plugin',
      node: result.root.first
    })
  )

  expect(result.messages).toEqual([warning])
})

it('allows to override plugin', () => {
  let plugin: Plugin = {
    postcssPlugin: 'test-plugin',
    Once(css, { result }) {
      result.warn('test', { plugin: 'test-plugin#one' })
    }
  }
  let result = postcss([plugin]).process('a{}').sync()

  expect(result.messages[0].plugin).toEqual('test-plugin#one')
})

it('allows Root', () => {
  let css = postcss.parse('a{}')
  let result = new Result(processor, css, {})
  result.warn('TT', { node: css.first })

  expect(result.messages[0].toString()).toEqual('<css input>:1:1: TT')
})

it('returns only warnings', () => {
  let result = new Result(processor, root, {})
  result.messages = [
    { type: 'warning', text: 'a' },
    { type: 'custom' },
    { type: 'warning', text: 'b' }
  ]
  expect(result.warnings()).toEqual([
    { type: 'warning', text: 'a' },
    { type: 'warning', text: 'b' }
  ])
})
