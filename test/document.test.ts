import { Result, parse, Root } from '../lib/postcss.js'
import Document from '../lib/document.js'

function prs(): Root {
  return new Root({ raws: { after: 'ok' } })
}

function str(node: Node, builder: (s: string) => void): void {
  builder(`${node.raws.after}!`)
}

it('generates result without map', () => {
  let root = parse('a {}')
  let document = new Document()

  document.append(root)

  let result = document.toResult()

  expect(result instanceof Result).toBe(true)
  expect(result.css).toBe('a {}')
})

it('generates result with undefined stringifier', () => {
  let root = parse('a {}')
  let document = new Document()

  document.append(root)

  let result = document.toResult({
    syntax: { parse: prs, stringify: str },
    from: undefined
  })

  expect(result instanceof Result).toBe(true)
  expect(result.css).toBe('undefined!')
})

it('generates result with map', () => {
  let root = parse('a {}')
  let document = new Document()

  document.append(root)

  let result = document.toResult({ map: true })

  expect(result instanceof Result).toBe(true)
  expect(result.css).toMatch(/a {}\n\/\*# sourceMappingURL=/)
})
