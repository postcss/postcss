import { is, type, equal, throws, not, instance } from 'uvu/assert'
import { test } from 'uvu'
import mozilla from 'source-map-js'
import { spy } from 'nanospy'

import NoWorkResult from '../lib/no-work-result.js'
import Processor from '../lib/processor.js'

let processor = new Processor()

test('contains AST on root access', () => {
  let result = new NoWorkResult(processor, 'a {}', { from: '/a.css' })
  is(result.root.nodes.length, 1)
})

test('has async() method', async () => {
  let noWorkResult = new NoWorkResult(processor, 'a {}', { from: '/a.css' })
  let result1 = await noWorkResult
  let result2 = await noWorkResult
  equal(result1, result2)
})

test('has sync() method', () => {
  let result = new NoWorkResult(processor, 'a {}', { from: '/a.css' }).sync()
  is(result.root.nodes.length, 1)
})

test('throws error on sync()', () => {
  let noWorkResult = new NoWorkResult(processor, 'a {', { from: '/a.css' })

  try {
    noWorkResult.root
  } catch {}

  throws(() => noWorkResult.sync(), 'AAA')
})

test('returns cached root on second access', async () => {
  let result = new NoWorkResult(processor, 'a {}', { from: '/a.css' })

  result.root

  is(result.root.nodes.length, 1)
  not.throws(() => result.sync())
})

test('contains css', () => {
  let result = new NoWorkResult(processor, 'a {}', { from: '/a.css' })
  is(result.css, 'a {}')
})

test('stringifies css', () => {
  let result = new NoWorkResult(processor, 'a {}', { from: '/a.css' })
  equal(`${result}`, result.css)
})

test('has content alias for css', () => {
  let result = new NoWorkResult(processor, 'a {}', { from: '/a.css' })
  is(result.content, 'a {}')
})

test('has map only if necessary', () => {
  let result1 = new NoWorkResult(processor, '', { from: '/a.css' })
  type(result1.map, 'undefined')

  let result2 = new NoWorkResult(processor, '', { from: '/a.css' })
  type(result2.map, 'undefined')

  let result3 = new NoWorkResult(processor, '', {
    from: '/a.css',
    map: { inline: false }
  })
  is(result3.map instanceof mozilla.SourceMapGenerator, true)
})

test('contains simple properties', () => {
  let result = new NoWorkResult(processor, 'a {}', {
    from: '/a.css',
    to: 'a.css'
  })
  instance(result.processor, Processor)
  equal(result.opts, { from: '/a.css', to: 'a.css' })
  equal(result.messages, [])
  equal(result.warnings(), [])
})

test('executes on finally callback', () => {
  let cb = spy()
  return new NoWorkResult(processor, 'a {}', { from: '/a.css' })
    .finally(cb)
    .then(() => {
      equal(cb.callCount, 1)
    })
})

test('prints its object type', () => {
  let result = new NoWorkResult(processor, 'a {}', { from: '/a.css' })
  is(Object.prototype.toString.call(result), '[object NoWorkResult]')
})

test.run()
