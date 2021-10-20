import { AtRule, parse } from '../lib/postcss.js'

it('initializes with properties', () => {
  let rule = new AtRule({ name: 'encoding', params: '"utf-8"' })

  expect(rule.name).toBe('encoding')
  expect(rule.params).toBe('"utf-8"')

  expect(rule.toString()).toBe('@encoding "utf-8"')
})

it('does not fall on childless at-rule', () => {
  let rule = new AtRule()
  rule.each(() => {
    throw new Error('AtRule has no children')
  })
})

it('creates nodes property on prepend()', () => {
  let rule = new AtRule()
  expect(rule.nodes).toBeUndefined()

  rule.prepend('color: black')
  expect(rule.nodes).toHaveLength(1)
})

it('creates nodes property on append()', () => {
  let rule = new AtRule()
  expect(rule.nodes).toBeUndefined()

  rule.append('color: black')
  expect(rule.nodes).toHaveLength(1)
})

it('inserts default spaces', () => {
  let rule = new AtRule({ name: 'page', params: 1, nodes: [] })
  expect(rule.toString()).toBe('@page 1 {}')
})

it('clone spaces from another at-rule', () => {
  let root = parse('@page{}a{}')
  let rule = new AtRule({ name: 'page', params: 1, nodes: [] })
  root.append(rule)

  expect(rule.toString()).toBe('@page 1{}')
})
