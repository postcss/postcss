const AtRule = require('../lib/at-rule')
const parse = require('../lib/parse')

it('initializes with properties', () => {
  const rule = new AtRule({ name: 'encoding', params: '"utf-8"' })

  expect(rule.name).toEqual('encoding')
  expect(rule.params).toEqual('"utf-8"')

  expect(rule.toString()).toEqual('@encoding "utf-8"')
})

it('does not fall on childless at-rule', () => {
  const rule = new AtRule()
  expect(rule.each(i => i)).not.toBeDefined()
})

it('creates nodes property on prepend()', () => {
  const rule = new AtRule()
  expect(rule.nodes).not.toBeDefined()

  rule.prepend('color: black')
  expect(rule.nodes).toHaveLength(1)
})

it('creates nodes property on append()', () => {
  const rule = new AtRule()
  expect(rule.nodes).not.toBeDefined()

  rule.append('color: black')
  expect(rule.nodes).toHaveLength(1)
})

it('inserts default spaces', () => {
  const rule = new AtRule({ name: 'page', params: 1, nodes: [] })
  expect(rule.toString()).toEqual('@page 1 {}')
})

it('clone spaces from another at-rule', () => {
  const root = parse('@page{}a{}')
  const rule = new AtRule({ name: 'page', params: 1, nodes: [] })
  root.append(rule)

  expect(rule.toString()).toEqual('@page 1{}')
})
