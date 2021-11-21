import { test } from 'uvu'
import { equal } from 'uvu/assert'

import { list } from '../lib/postcss.js'

test('space() splits list by spaces', () => {
  equal(list.space('a b'), ['a', 'b'])
})

test('space() trims values', () => {
  equal(list.space(' a  b '), ['a', 'b'])
})

test('space() checks quotes', () => {
  equal(list.space('"a b\\"" \'\''), ['"a b\\""', "''"])
})

test('space() checks functions', () => {
  equal(list.space('f( )) a( () )'), ['f( ))', 'a( () )'])
})

test('space() does not split on escaped spaces', () => {
  equal(list.space('a\\ b'), ['a\\ b'])
})

test('space() works from variable', () => {
  let space = list.space
  equal(space('a b'), ['a', 'b'])
})

test('comma() splits list by spaces', () => {
  equal(list.comma('a, b'), ['a', 'b'])
})

test('comma() adds last empty', () => {
  equal(list.comma('a, b,'), ['a', 'b', ''])
})

test('comma() checks quotes', () => {
  equal(list.comma('"a,b\\"", \'\''), ['"a,b\\""', "''"])
})

test('comma() checks functions', () => {
  equal(list.comma('f(,)), a(,(),)'), ['f(,))', 'a(,(),)'])
})

test('comma() does not split on escaped commas', () => {
  equal(list.comma('a\\, b'), ['a\\, b'])
})

test('comma() works from variable', () => {
  let comma = list.comma
  equal(comma('a, b'), ['a', 'b'])
})

test.run()
