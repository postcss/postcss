import mozilla from 'source-map-js'

import NoWork from '../lib/no-work.js'
import Processor from '../lib/processor.js'

let processor = new Processor()

it('does not contain result if not processed', () => {
  let noWork = new NoWork(processor, 'a {}', {})
  // @ts-ignore
  expect(noWork.result).toBeUndefined()
})

it('contains AST if root is accessed', () => {
  let result = new NoWork(processor, 'a {}', {})
  expect(result.root.type).toBe('root')
})

it('will stringify css', () => {
  let result = new NoWork(processor, 'a {}', {})
  expect(result.css).toBe('a {}')
})

it('stringifies css', () => {
  let result = new NoWork(processor, 'a {}', {})
  expect(`${result}`).toEqual(result.css)
})

it('has content alias for css', () => {
  let result = new NoWork(processor, 'a {}', {})
  expect(result.content).toBe('a {}')
})

it('has map only if necessary', () => {
  let result1 = new NoWork(processor, '', {})
  expect(result1.map).toBeUndefined()

  let result2 = new NoWork(processor, '', {})
  expect(result2.map).toBeUndefined()

  let result3 = new NoWork(processor, '', { map: { inline: false } })
  expect(result3.map instanceof mozilla.SourceMapGenerator).toBe(true)
})

it('contains options', () => {
  let result = new NoWork(processor, 'a {}', { to: 'a.css' })
  expect(result.opts).toEqual({ to: 'a.css' })
})

it('contains warnings', () => {
  let result = new NoWork(processor, 'a {}', {})
  expect(result.warnings()).toEqual([])
})

it('contains messages', () => {
  let result = new NoWork(processor, 'a {}', {})
  expect(result.messages).toEqual([])
})

it('executes on finally callback', () => {
  let mockCallback = jest.fn()
  return new NoWork(processor, 'a {}', {}).finally(mockCallback).then(() => {
    expect(mockCallback).toHaveBeenCalledTimes(1)
  })
})

it('prints its object type', () => {
  let result = new NoWork(processor, 'a {}', {})
  expect(Object.prototype.toString.call(result)).toBe('[object NoWork]')
})
