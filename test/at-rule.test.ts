import { test } from 'uvu'
import { is, type } from 'uvu/assert'

import { AtRule, parse } from '../lib/postcss.js'

test('initializes with properties', () => {
  let rule = new AtRule({ name: 'encoding', params: '"utf-8"' })

  is(rule.name, 'encoding')
  is(rule.params, '"utf-8"')

  is(rule.toString(), '@encoding "utf-8"')
})

test('does not fall on childless at-rule', () => {
  let rule = new AtRule()
  rule.each(() => {
    throw new Error('AtRule has no children')
  })
})

test('creates nodes property on prepend()', () => {
  let rule = new AtRule()
  type(rule.nodes, 'undefined')

  rule.prepend('color: black')
  is(rule.nodes?.length, 1)
})

test('creates nodes property on append()', () => {
  let rule = new AtRule()
  type(rule.nodes, 'undefined')

  rule.append('color: black')
  is(rule.nodes?.length, 1)
})

test('inserts default spaces', () => {
  let rule = new AtRule({ name: 'page', nodes: [], params: 1 })
  is(rule.toString(), '@page 1 {}')
})

test('clone spaces from another at-rule', () => {
  let root = parse('@page{}a{}')
  let rule = new AtRule({ name: 'page', nodes: [], params: 1 })
  root.append(rule)

  is(rule.toString(), '@page 1{}')
})

test('at-rule without body has no nodes property', () => {
  let root = parse('@layer a, b, c;')
  let layer = root.first as AtRule
  type(layer.nodes, 'undefined')
})

test('keeps comments in params after changes', () => {
  let root = parse('@media screen /* keep */ and (color){}')
  let media = root.first as AtRule

  is(media.params, 'screen /* keep */ and (color)')
  media.params += ' and (width > 1px)'
  is(
    media.toString(),
    '@media screen /* keep */ and (color) and (width > 1px){}'
  )
})

test.run()
