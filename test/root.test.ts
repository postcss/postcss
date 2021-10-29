import LazyResult from '../lib/lazy-result.js'
import NoWork from '../lib/no-work.js'
import { Result, parse, Stringifier } from '../lib/postcss.js'

it('prepend() fixes spaces on insert before first', () => {
  let css = parse('a {} b {}')
  css.prepend({ selector: 'em' })
  expect(css.toString()).toBe('em {} a {} b {}')
})

it('prepend() fixes spaces on multiple inserts before first', () => {
  let css = parse('a {} b {}')
  css.prepend({ selector: 'em' }, { selector: 'strong' })
  expect(css.toString()).toBe('em {} strong {} a {} b {}')
})

it('prepend() uses default spaces on only first', () => {
  let css = parse('a {}')
  css.prepend({ selector: 'em' })
  expect(css.toString()).toBe('em {}\na {}')
})

it('append() sets new line between rules in multiline files', () => {
  let a = parse('a {}\n\na {}\n')
  let b = parse('b {}\n')
  expect(a.append(b).toString()).toBe('a {}\n\na {}\n\nb {}\n')
})

it('insertAfter() does not use before of first rule', () => {
  let css = parse('a{} b{}')
  css.insertAfter(0, { selector: '.a' })
  css.insertAfter(2, { selector: '.b' })

  expect(css.nodes[1].raws.before).toBeUndefined()
  expect(css.nodes[3].raws.before).toBe(' ')
  expect(css.toString()).toBe('a{} .a{} b{} .b{}')
})

it('fixes spaces on removing first rule', () => {
  let css = parse('a{}\nb{}\n')
  if (!css.first) throw new Error('No nodes were parsed')
  css.first.remove()
  expect(css.toString()).toBe('b{}\n')
})

it('keeps spaces on moving root', () => {
  let css1 = parse('a{}\nb{}\n')

  let css2 = parse('')
  css2.append(css1)
  expect(css2.toString()).toBe('a{}\nb{}')

  let css3 = parse('\n')
  css3.append(css2.nodes)
  expect(css3.toString()).toBe('a{}\nb{}\n')
})

it('generates result with map', () => {
  let root = parse('a {}')
  let result = root.toResult({ map: true })

  expect(result instanceof Result).toBe(true)
  expect(result.css).toMatch(/a {}\n\/\*# sourceMappingURL=/)
})

it('uses NoWork inside if no plugins, stringifier or parsers defined', () => {
  let spy = jest.spyOn(NoWork.prototype, 'sync')
  let root = parse('a {}')

  root.toResult({})

  // eslint-disable-next-line
  expect(spy).toHaveBeenCalled()
  spy.mockRestore()
})

it('uses LazyWorkResult inside if stringifier defined', () => {
  let spy = jest.spyOn(LazyResult.prototype, 'sync')
  let root = parse('a {}')

  let customStringifier: Stringifier = doc => {
    doc.toString()
  }

  root.toResult({ stringifier: customStringifier })

  // eslint-disable-next-line
  expect(spy).toHaveBeenCalled()
  spy.mockRestore()
})
