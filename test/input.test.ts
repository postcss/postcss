import { test } from 'uvu'
import { equal, is } from 'uvu/assert'

import { Input } from '../lib/postcss.js'

test('fromLineAndColumn() returns offset', () => {
  let input = new Input('a {\n}')
  is(input.fromLineAndColumn(1, 1), 0)
  is(input.fromLineAndColumn(1, 3), 2)
  is(input.fromLineAndColumn(2, 1), 4)
  is(input.fromLineAndColumn(2, 2), 5)
})

test('fromOffset() returns line and column', () => {
  let input = new Input('a {\n}')
  equal(input.fromOffset(0), { col: 1, line: 1 })
  equal(input.fromOffset(2), { col: 3, line: 1 })
  equal(input.fromOffset(4), { col: 1, line: 2 })
  equal(input.fromOffset(5), { col: 2, line: 2 })
})
