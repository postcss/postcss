import mozilla from 'source-map-js'
import { test } from 'uvu'
import { is, type, equal, throws, not, instance } from 'uvu/assert'

import NoWorkResult from '../lib/no-work-result.js'
import { CssSyntaxError } from '../lib/postcss.js'
import Processor from '../lib/processor.js'

let processor = new Processor()

test('contains AST on root access', () => {
  let result = new NoWorkResult(processor, 'a {}', {})
  is(result.root.nodes.length, 1)
})

test('has async() method', async () => {
  let noWorkResult = new NoWorkResult(processor, 'a {}', {})
  let result1 = await noWorkResult
  let result2 = await noWorkResult
  equal(result1, result2)
})

test('has sync() method', () => {
  let result = new NoWorkResult(processor, 'a {}', {}).sync()
  is(result.root.nodes.length, 1)
})

test('throws error on sync()', () => {
  let noWorkResult = new NoWorkResult(processor, 'a {', {})

  noWorkResult.root // process AST

  throws(() => noWorkResult.sync())
})

test('returns cached root on second access', async () => {
  let result = new NoWorkResult(processor, 'a {}', {})

  result.root

  is(result.root.nodes.length, 1)
  not.throws(() => result.sync())
})

test('contains css syntax errors', () => {
  let result = new NoWorkResult(processor, 'a {', {})
  result.root
  // @ts-ignore
  instance(result.error, CssSyntaxError)
})

test('contains css', () => {
  let result = new NoWorkResult(processor, 'a {}', {})
  is(result.css, 'a {}')
})

test('stringifies css', () => {
  let result = new NoWorkResult(processor, 'a {}', {})
  equal(`${result}`, result.css)
})

test('has content alias for css', () => {
  let result = new NoWorkResult(processor, 'a {}', {})
  is(result.content, 'a {}')
})

test('has map only if necessary', () => {
  let result1 = new NoWorkResult(processor, '', {})
  type(result1.map, 'undefined')

  let result2 = new NoWorkResult(processor, '', {})
  type(result2.map, 'undefined')

  let result3 = new NoWorkResult(processor, '', { map: { inline: false } })
  is(result3.map instanceof mozilla.SourceMapGenerator, true)
})

test('contains processor', () => {
  let result = new NoWorkResult(processor, 'a {}', { to: 'a.css' })
  instance(result.processor, Processor)
})

test('contains options', () => {
  let result = new NoWorkResult(processor, 'a {}', { to: 'a.css' })
  equal(result.opts, { to: 'a.css' })
})

test('contains warnings', () => {
  let result = new NoWorkResult(processor, 'a {}', {})
  equal(result.warnings(), [])
})

test('contains messages', () => {
  let result = new NoWorkResult(processor, 'a {}', {})
  equal(result.messages, [])
})

test('executes on finally callback', () => {
  let mockCallbackHaveBeenCalled = 0
  let mockCallback = (): void => {
    mockCallbackHaveBeenCalled++
  }
  return new NoWorkResult(processor, 'a {}', {})
    .finally(mockCallback)
    .then(() => {
      is(mockCallbackHaveBeenCalled, 1)
    })
})

test('prints its object type', () => {
  let result = new NoWorkResult(processor, 'a {}', {})
  is(Object.prototype.toString.call(result), '[object NoWorkResult]')
})

test.run()
