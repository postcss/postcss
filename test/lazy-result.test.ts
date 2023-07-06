import { SourceMapGenerator } from 'source-map-js'
import { test } from 'uvu'
import { equal, is, type } from 'uvu/assert'

import LazyResult from '../lib/lazy-result.js'
import Processor from '../lib/processor.js'

let processor = new Processor()

test('contains AST', () => {
  let result = new LazyResult(processor, 'a {}', {})
  is(result.root.type, 'root')
})

test('will stringify css', () => {
  let result = new LazyResult(processor, 'a {}', {})
  is(result.css, 'a {}')
})

test('stringifies css', () => {
  let result = new LazyResult(processor, 'a {}', {})
  is(`${result}`, result.css)
})

test('has content alias for css', () => {
  let result = new LazyResult(processor, 'a {}', {})
  is(result.content, 'a {}')
})

test('has map only if necessary', () => {
  let result1 = new LazyResult(processor, '', {})
  type(result1.map, 'undefined')

  let result2 = new LazyResult(processor, '', {})
  type(result2.map, 'undefined')

  let result3 = new LazyResult(processor, '', { map: { inline: false } })
  is(result3.map instanceof SourceMapGenerator, true)
})

test('contains options', () => {
  let result = new LazyResult(processor, 'a {}', { to: 'a.css' })
  equal(result.opts, { to: 'a.css' })
})

test('contains warnings', () => {
  let result = new LazyResult(processor, 'a {}', {})
  equal(result.warnings(), [])
})

test('contains messages', () => {
  let result = new LazyResult(processor, 'a {}', {})
  equal(result.messages, [])
})

test('executes on finally callback', () => {
  let callbackHaveBeenCalled = 0
  let mockCallback = (): void => {
    callbackHaveBeenCalled++
  }
  return new LazyResult(processor, 'a {}', {})
    .finally(mockCallback)
    .then(() => {
      is(callbackHaveBeenCalled, 1)
    })
})

test('prints its object type', () => {
  let result = new LazyResult(processor, 'a {}', {})
  is(Object.prototype.toString.call(result), '[object LazyResult]')
})

test.run()
