const LazyResult = require('../lib/lazy-result')
const Processor = require('../lib/processor')

const mozilla = require('source-map')

const processor = new Processor()

it('contains AST', () => {
  const result = new LazyResult(processor, 'a {}', { })
  expect(result.root.type).toEqual('root')
})

it('will stringify css', () => {
  const result = new LazyResult(processor, 'a {}', { })
  expect(result.css).toEqual('a {}')
})

it('stringifies css', () => {
  const result = new LazyResult(processor, 'a {}', { })
  expect('' + result).toEqual(result.css)
})

it('has content alias for css', () => {
  const result = new LazyResult(processor, 'a {}', { })
  expect(result.content).toEqual('a {}')
})

it('has map only if necessary', () => {
  const result1 = new LazyResult(processor, '', { })
  expect(result1.map).not.toBeDefined()

  const result2 = new LazyResult(processor, '', { })
  expect(result2.map).not.toBeDefined()

  const result3 = new LazyResult(processor, '', { map: { inline: false } })
  expect(result3.map instanceof mozilla.SourceMapGenerator).toBeTruthy()
})

it('contains options', () => {
  const result = new LazyResult(processor, 'a {}', { to: 'a.css' })
  expect(result.opts).toEqual({ to: 'a.css' })
})

it('contains warnings', () => {
  const result = new LazyResult(processor, 'a {}', { })
  expect(result.warnings()).toEqual([])
})

it('contains messages', () => {
  const result = new LazyResult(processor, 'a {}', { })
  expect(result.messages).toEqual([])
})

it('executes on finally callback', () => {
  const mockCallback = jest.fn()

  return new LazyResult(processor, 'a {}', { })
    .finally(mockCallback)
    .then(() => expect(mockCallback).toHaveBeenCalledTimes(1))
})
