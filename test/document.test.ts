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

test.run()
