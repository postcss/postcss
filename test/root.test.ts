import { test } from 'uvu'
import { is, match, type } from 'uvu/assert'

import { parse, Result } from '../lib/postcss.js'

test('prepend() fixes spaces on insert before first', () => {
  let css = parse('a {} b {}')
  css.prepend({ selector: 'em' })
  is(css.toString(), 'em {} a {} b {}')
})

test('prepend() fixes spaces on multiple inserts before first', () => {
  let css = parse('a {} b {}')
  css.prepend({ selector: 'em' }, { selector: 'strong' })
  is(css.toString(), 'em {} strong {} a {} b {}')
})

test('prepend() uses default spaces on only first', () => {
  let css = parse('a {}')
  css.prepend({ selector: 'em' })
  is(css.toString(), 'em {}\na {}')
})

test('append() sets new line between rules in multiline files', () => {
  let a = parse('a {}\n\na {}\n')
  let b = parse('b {}\n')
  is(a.append(b).toString(), 'a {}\n\na {}\n\nb {}\n')
})

test('insertAfter() does not use before of first rule', () => {
  let css = parse('a{} b{}')
  css.insertAfter(0, { selector: '.a' })
  css.insertAfter(2, { selector: '.b' })

  type(css.nodes[1].raws.before, 'undefined')
  is(css.nodes[3].raws.before, ' ')
  is(css.toString(), 'a{} .a{} b{} .b{}')
})

test('fixes spaces on removing first rule', () => {
  let css = parse('a{}\nb{}\n')
  if (!css.first) throw new Error('No nodes were parsed')
  css.first.remove()
  is(css.toString(), 'b{}\n')
})

test('keeps spaces on moving root', () => {
  let css1 = parse('a{}\nb{}\n')

  let css2 = parse('')
  css2.append(css1)
  is(css2.toString(), 'a{}\nb{}')

  let css3 = parse('\n')
  css3.append(css2.nodes)
  is(css3.toString(), 'a{}\nb{}\n')
})

test('generates result with map', () => {
  let root = parse('a {}')
  let result = root.toResult({ map: true })

  is(result instanceof Result, true)
  match(result.css, /a {}\n\/\*# sourceMappingURL=/)
})

test.run()
