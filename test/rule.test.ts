import { test } from 'uvu'
import { equal, is } from 'uvu/assert'

import { parse, Rule } from '../lib/postcss.js'

test('initializes with properties', () => {
  let rule = new Rule({ selector: 'a' })
  is(rule.selector, 'a')
})

test('returns array in selectors', () => {
  let rule = new Rule({ selector: 'a,b' })
  equal(rule.selectors, ['a', 'b'])
})

test('trims selectors', () => {
  let rule = new Rule({ selector: '.a\n, .b  , .c' })
  equal(rule.selectors, ['.a', '.b', '.c'])
})

test('is smart about selectors commas', () => {
  let rule = new Rule({
    selector: "[foo='a, b'], a:-moz-any(:focus, [href*=','])"
  })
  equal(rule.selectors, ["[foo='a, b']", "a:-moz-any(:focus, [href*=','])"])
})

test('receive array in selectors', () => {
  let rule = new Rule({ selector: 'i, b' })
  rule.selectors = ['em', 'strong']
  is(rule.selector, 'em, strong')
})

test('saves separator in selectors', () => {
  let rule = new Rule({ selector: 'i,\nb' })
  rule.selectors = ['em', 'strong']
  is(rule.selector, 'em,\nstrong')
})

test('uses between to detect separator in selectors', () => {
  let rule = new Rule({ raws: { between: '' }, selector: 'b' })
  rule.selectors = ['b', 'strong']
  is(rule.selector, 'b,strong')
})

test('uses space in separator be default in selectors', () => {
  let rule = new Rule({ selector: 'b' })
  rule.selectors = ['b', 'strong']
  is(rule.selector, 'b, strong')
})

test('selectors works in constructor', () => {
  let rule = new Rule({ selectors: ['a', 'b'] })
  is(rule.selector, 'a, b')
})

test('inserts default spaces', () => {
  let rule = new Rule({ selector: 'a' })
  is(rule.toString(), 'a {}')
  rule.append({ prop: 'color', value: 'black' })
  is(rule.toString(), 'a {\n    color: black\n}')
})

test('clones spaces from another rule', () => {
  let root = parse('b{\n  }')
  let rule = new Rule({ selector: 'em' })
  root.append(rule)
  is(root.toString(), 'b{\n  }\nem{\n  }')
})

test('uses different spaces for empty rules', () => {
  let root = parse('a{}\nb{\n a:1\n}')
  let rule = new Rule({ selector: 'em' })
  root.append(rule)
  is(root.toString(), 'a{}\nb{\n a:1\n}\nem{}')

  rule.append({ prop: 'top', value: '0' })
  is(root.toString(), 'a{}\nb{\n a:1\n}\nem{\n top:0\n}')
})

test.run()
