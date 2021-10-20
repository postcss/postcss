import mozilla from 'source-map-js'

import LazyResult from '../lib/lazy-result.js'
import Processor from '../lib/processor.js'

let processor = new Processor()

it('contains AST', () => {
  let result = new LazyResult(processor, 'a {}', {})
  expect(result.root.type).toBe('root')
})

it('will stringify css', () => {
  let result = new LazyResult(processor, 'a {}', {})
  expect(result.css).toBe('a {}')
})

it('stringifies css', () => {
  let result = new LazyResult(processor, 'a {}', {})
  expect(`${result}`).toEqual(result.css)
})

it('has content alias for css', () => {
  let result = new LazyResult(processor, 'a {}', {})
  expect(result.content).toBe('a {}')
})

it('has map only if necessary', () => {
  let result1 = new LazyResult(processor, '', {})
  expect(result1.map).toBeUndefined()

  let result2 = new LazyResult(processor, '', {})
  expect(result2.map).toBeUndefined()

  let result3 = new LazyResult(processor, '', { map: { inline: false } })
  expect(result3.map instanceof mozilla.SourceMapGenerator).toBe(true)
})

it('contains options', () => {
  let result = new LazyResult(processor, 'a {}', { to: 'a.css' })
  expect(result.opts).toEqual({ to: 'a.css' })
})

it('contains warnings', () => {
  let result = new LazyResult(processor, 'a {}', {})
  expect(result.warnings()).toEqual([])
})

it('contains messages', () => {
  let result = new LazyResult(processor, 'a {}', {})
  expect(result.messages).toEqual([])
})

it('executes on finally callback', () => {
  let mockCallback = jest.fn()
  return new LazyResult(processor, 'a {}', {})
    .finally(mockCallback)
    .then(() => {
      expect(mockCallback).toHaveBeenCalledTimes(1)
    })
})

it('prints its object type', () => {
  let result = new LazyResult(processor, 'a {}', {})
  expect(Object.prototype.toString.call(result)).toBe('[object LazyResult]')
})
