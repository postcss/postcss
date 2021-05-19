import { Result, parse } from '../lib/postcss.js'
import Document from '../lib/document.js'

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
