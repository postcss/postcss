import { test } from 'uvu'
import { is } from 'uvu/assert'

import { Declaration, parse, Rule } from '../lib/postcss.js'

test('initializes with properties', () => {
  let decl = new Declaration({ prop: 'color', value: 'black' })
  is(decl.prop, 'color')
  is(decl.value, 'black')
})

test('returns boolean important', () => {
  let decl = new Declaration({ prop: 'color', value: 'black' })
  decl.important = true
  is(decl.toString(), 'color: black !important')
})

test('inserts default spaces', () => {
  let decl = new Declaration({ prop: 'color', value: 'black' })
  let rule = new Rule({ selector: 'a' })
  rule.append(decl)
  is(rule.toString(), 'a {\n    color: black\n}')
})

test('clones spaces from another declaration', () => {
  let root = parse('a{color:black}')
  let rule = root.first as Rule
  let decl = new Declaration({ prop: 'margin', value: '0' })
  rule.append(decl)
  is(root.toString(), 'a{color:black;margin:0}')
})

test('converts value to string', () => {
  // @ts-expect-error
  let decl = new Declaration({ prop: 'color', value: 1 })
  is(decl.value, '1')
})

test('detects variable declarations', () => {
  let prop = new Declaration({ prop: '--color', value: 'black' })
  is(prop.variable, true)
  let sass = new Declaration({ prop: '$color', value: 'black' })
  is(sass.variable, true)
  let decl = new Declaration({ prop: 'color', value: 'black' })
  is(decl.variable, false)
})

test.run()
