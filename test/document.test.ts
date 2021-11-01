
import { Result, Stringifier, parse } from '../lib/postcss.js'

import { Result, parse, Root } from '../lib/postcss.js'

import Document from '../lib/document.js'
import NoWork from '../lib/no-work.js'
import LazyResult from '../lib/lazy-result.js'

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
