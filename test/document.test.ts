import { test } from 'uvu'
import { is, match } from 'uvu/assert'

import Document from '../lib/document.js'
import { parse, Result } from '../lib/postcss.js'

test('generates result without map', () => {
  let root = parse('a {}')
  let document = new Document()

  document.append(root)

  let result = document.toResult()

  is(result instanceof Result, true)
  is(result.css, 'a {}')
})

test('generates result with map', () => {
  let root = parse('a {}')
  let document = new Document()

  document.append(root)

  let result = document.toResult({ map: true })

  is(result instanceof Result, true)
  match(result.css, /a {}\n\/\*# sourceMappingURL=/)
})

test('clears source map annotations in document with map: false', () => {
  let root1 = parse('a {}\n/*# sourceMappingURL=old1.map */')
  let root2 = parse('b {}\n/*# sourceMappingURL=old2.map */')
  let document = new Document()
  document.append(root1)
  document.append(root2)

  let result = document.toResult({ map: false })
  is(result.css, 'a {}b {}')
})

test('clears previous source map annotations and generates new map', () => {
  let root1 = parse('a {}\n/*# sourceMappingURL=old1.map */')
  let root2 = parse('b {}\n/*# sourceMappingURL=old2.map */')
  let document = new Document()
  document.append(root1)
  document.append(root2)

  let result = document.toResult({ map: true })
  match(
    result.css,
    /^a \{\}b \{\}\n\/\*# sourceMappingURL=data:application\/json;base64,/
  )
  is(result.css.includes('old1.map'), false)
  is(result.css.includes('old2.map'), false)
})

test('clears direct comment annotations on document', () => {
  let document = new Document()
  let comment = parse('/*# sourceMappingURL=direct.map */').first
  if (comment) document.append(comment)
  document.append(parse('a {}'))

  let result = document.toResult({ map: false })
  is(result.css, 'a {}')
})

test('preserves annotations when annotation option is explicitly false', () => {
  let root = parse('a {}\n/*# sourceMappingURL=old.map */')
  let document = new Document()
  document.append(root)

  let result = document.toResult({ map: { annotation: false } })
  is(result.css, 'a {}\n/*# sourceMappingURL=old.map */')
})

test.run()
