import mozilla from 'source-map-js'

import NoWorkResult from '../lib/no-work-result.js'
import { CssSyntaxError } from '../lib/postcss.js'
import Processor from '../lib/processor.js'

let processor = new Processor()

it('contains AST on root access', () => {
  let result = new NoWorkResult(processor, 'a {}', {})
  expect(result.root.nodes).toHaveLength(1)
})

it('has async() method', async () => {
  let noWorkResult = new NoWorkResult(processor, 'a {}', {})
  let result1 = await noWorkResult
  let result2 = await noWorkResult
  expect(result1).toEqual(result2)
})

it('has sync() method', () => {
  let result = new NoWorkResult(processor, 'a {}', {}).sync()
  expect(result.root.nodes).toHaveLength(1)
})

it('throws error on sync()', () => {
  let noWorkResult = new NoWorkResult(processor, 'a {', {})

  noWorkResult.root // process AST

  expect(() => noWorkResult.sync()).toThrow(CssSyntaxError)
})

it('returns cached root on second access', () => {
  let result = new NoWorkResult(processor, 'a {}', {})

  // @ts-ignore
  expect(result._root).toBeUndefined()
  expect(result.root.nodes).toHaveLength(1)

  // @ts-ignore
  expect(result._root).toBeDefined()
  expect(result.root.nodes).toHaveLength(1)
})

it('contains css syntax errors', () => {
  let result = new NoWorkResult(processor, 'a {', {})
  result.root
  // @ts-ignore
  expect(result.error).toBeInstanceOf(CssSyntaxError)
})

it('contains css', () => {
  let result = new NoWorkResult(processor, 'a {}', {})
  expect(result.css).toBe('a {}')
})

it('stringifies css', () => {
  let result = new NoWorkResult(processor, 'a {}', {})
  expect(`${result}`).toEqual(result.css)
})

it('has content alias for css', () => {
  let result = new NoWorkResult(processor, 'a {}', {})
  expect(result.content).toBe('a {}')
})

it('has map only if necessary', () => {
  let result1 = new NoWorkResult(processor, '', {})
  expect(result1.map).toBeUndefined()

  let result2 = new NoWorkResult(processor, '', {})
  expect(result2.map).toBeUndefined()

  let result3 = new NoWorkResult(processor, '', { map: { inline: false } })
  expect(result3.map instanceof mozilla.SourceMapGenerator).toBe(true)
})

it('contains processor', () => {
  let result = new NoWorkResult(processor, 'a {}', { to: 'a.css' })
  expect(result.processor).toBeInstanceOf(Processor)
})

it('contains options', () => {
  let result = new NoWorkResult(processor, 'a {}', { to: 'a.css' })
  expect(result.opts).toEqual({ to: 'a.css' })
})

it('contains warnings', () => {
  let result = new NoWorkResult(processor, 'a {}', {})
  expect(result.warnings()).toEqual([])
})

it('contains messages', () => {
  let result = new NoWorkResult(processor, 'a {}', {})
  expect(result.messages).toEqual([])
})

it('executes on finally callback', () => {
  let mockCallback = jest.fn()
  return new NoWorkResult(processor, 'a {}', {})
    .finally(mockCallback)
    .then(() => {
      expect(mockCallback).toHaveBeenCalledTimes(1)
    })
})

it('prints its object type', () => {
  let result = new NoWorkResult(processor, 'a {}', {})
  expect(Object.prototype.toString.call(result)).toBe('[object NoWorkResult]')
})
