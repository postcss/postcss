const Declaration = require('../lib/declaration')
const parse = require('../lib/parse')
const Rule = require('../lib/rule')

it('initializes with properties', () => {
  const decl = new Declaration({ prop: 'color', value: 'black' })
  expect(decl.prop).toEqual('color')
  expect(decl.value).toEqual('black')
})

it('returns boolean important', () => {
  const decl = new Declaration({ prop: 'color', value: 'black' })
  decl.important = true
  expect(decl.toString()).toEqual('color: black !important')
})

it('inserts default spaces', () => {
  const decl = new Declaration({ prop: 'color', value: 'black' })
  const rule = new Rule({ selector: 'a' })
  rule.append(decl)
  expect(rule.toString()).toEqual('a {\n    color: black\n}')
})

it('clones spaces from another declaration', () => {
  const root = parse('a{color:black}')
  const decl = new Declaration({ prop: 'margin', value: '0' })
  root.first.append(decl)
  expect(root.toString()).toEqual('a{color:black;margin:0}')
})
