import { test } from 'uvu'
import { equal } from 'uvu/assert'

import { list } from '../lib/postcss.js'

test('space() splits list by spaces', () => {
  equal(list.space('a b'), ['a', 'b'])
})

test('space() trims values', () => {
  equal(list.space(' a  b '), ['a', 'b'])
})

test('space() ignores repeated spaces', () => {
  equal(list.space('a  b'), ['a', 'b'])
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

test('space() ignores whitespace it does not split on', () => {
  equal(list.space('\r'), [])
})

test('space() does not add empty values around CRLF line breaks', () => {
  equal(list.space('"a b"\r\n\r\n"c d"'), ['"a b"', '"c d"'])
})

test('space() gives the same result for LF and CRLF', () => {
  equal(list.space('a\r\n\r\nb'), list.space('a\n\nb'))
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

test('comma() keeps empty value', () => {
  equal(list.comma(''), [''])
})

test('comma() ignores non-string values', () => {
  // @ts-expect-error Testing invalid API
  equal(list.comma(undefined), [])
})

test('comma() keeps first empty', () => {
  equal(list.comma(', b'), ['', 'b'])
})

test('comma() keeps empty between values', () => {
  equal(list.comma('a,, b'), ['a', '', 'b'])
})

test('comma() keeps empty regardless of spaces', () => {
  equal(list.comma('a,,b'), list.comma('a, ,b'))
})

test('comma() keeps every empty value', () => {
  equal(list.comma(',,'), ['', '', ''])
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
