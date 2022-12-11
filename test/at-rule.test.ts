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
  is(rule.nodes.length, 1)
})

test('creates nodes property on append()', () => {
  let rule = new AtRule()
  type(rule.nodes, 'undefined')

  rule.append('color: black')
  is(rule.nodes.length, 1)
})

test('inserts default spaces', () => {
  let rule = new AtRule({ name: 'page', params: 1, nodes: [] })
  is(rule.toString(), '@page 1 {}')
})

test('clone spaces from another at-rule', () => {
  let root = parse('@page{}a{}')
  let rule = new AtRule({ name: 'page', params: 1, nodes: [] })
  root.append(rule)

  is(rule.toString(), '@page 1{}')
})

test('at layer', () => {
  let root = parse(`@layer foo {\n  @layer one, two\n}`)
  let layer1 = root.nodes[0] as AtRule;
  let layer2 = layer1.nodes[0] as AtRule;

  is(root.source?.start?.offset, 0)
  is(root.source?.start?.line, 1)
  is(root.source?.start?.column, 1)

  is(layer1.source?.start?.offset, 0)
  is(layer1.source?.start?.line, 1)
  is(layer1.source?.start?.column, 1)

  is(layer1.source?.end?.offset, 31)
  is(layer1.source?.end?.line, 3)
  is(layer1.source?.end?.column, 1)

  is(layer2.source?.start?.offset, 15)
  is(layer2.source?.start?.line, 2)
  is(layer2.source?.start?.column, 3)

  is(layer2.source?.end?.offset, 29)
  is(layer2.source?.end?.line, 2)
  is(layer2.source?.end?.column, 17)

  is(root.toString(), '@layer foo {\n  @layer one, two\n}')
})

test.run()
