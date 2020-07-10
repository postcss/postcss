import Processor from '../lib/processor.js'
import Warning from '../lib/warning.js'
import postcss from '../lib/postcss.js'
import Result from '../lib/result.js'
import Root from '../lib/root.js'

let processor = new Processor()
let root = new Root()

it('stringifies', () => {
  let result = new Result(processor, root, {})
  result.css = 'a{}'
  expect(`${result}`).toEqual(result.css)
})

it('adds warning', () => {
  let warning
  let plugin = postcss.plugin('test-plugin', () => {
    return (css, res) => {
      warning = res.warn('test', { node: css.first })
    }
  })
  let result = postcss([plugin])
    .process('a{}')
    .sync()

  expect(warning).toEqual(
    new Warning('test', {
      plugin: 'test-plugin',
      node: result.root.first
    })
  )

  expect(result.messages).toEqual([warning])
})

it('allows to override plugin', () => {
  let plugin = postcss.plugin('test-plugin', () => {
    return (css, res) => {
      res.warn('test', { plugin: 'test-plugin#one' })
    }
  })
  let result = postcss([plugin])
    .process('a{}')
    .sync()

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
