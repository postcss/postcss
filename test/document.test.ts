import { Result, Stringifier, parse } from '../lib/postcss.js'
import Document from '../lib/document.js'
import NoWork from '../lib/no-work.js'
import LazyResult from '../lib/lazy-result.js'

it('generates result without map', () => {
  let root = parse('a {}')
  let document = new Document()

  document.append(root)

  let result = document.toResult()

  expect(result instanceof Result).toBe(true)
  expect(result.css).toBe('a {}')
})

it('generates result with map', () => {
  let root = parse('a {}')
  let document = new Document()

  document.append(root)

  let result = document.toResult({ map: true })

  expect(result instanceof Result).toBe(true)
  expect(result.css).toMatch(/a {}\n\/\*# sourceMappingURL=/)
})

it('uses NoWork inside if no plugins, stringifier or parsers defined', () => {
  let spy = jest.spyOn(NoWork.prototype, 'sync')
  let root = parse('a {}')
  let document = new Document()

  document.append(root)

  document.toResult({})

  spy.mockRestore()
})

it('uses LazyWorkResult inside if stringifier defined', () => {
  let spy = jest.spyOn(LazyResult.prototype, 'sync')
  let root = parse('a {}')
  let document = new Document()

  document.append(root)

  let customStringifier: Stringifier = doc => {
    doc.toString()
  }

  document.toResult({ stringifier: customStringifier })

  // eslint-disable-next-line
  expect(spy).toHaveBeenCalledWith()
  spy.mockRestore()
})
