let rewire = require('rewire')
let Result = require('../lib/result')
let parse = require('../lib/parse')

let rootRewire = rewire('../lib/root')
let validateNameTypeNode = rootRewire.__get__('validateNameTypeNode')
let normalizeVisitorPlugin = rootRewire.__get__('normalizeVisitorPlugin')
let buildVisitorObject = rootRewire.__get__('buildVisitorObject')

it('prepend() fixes spaces on insert before first', () => {
  let css = parse('a {} b {}')
  css.prepend({ selector: 'em' })
  expect(css.toString()).toEqual('em {} a {} b {}')
})

it('prepend() fixes spaces on multiple inserts before first', () => {
  let css = parse('a {} b {}')
  css.prepend({ selector: 'em' }, { selector: 'strong' })
  expect(css.toString()).toEqual('em {} strong {} a {} b {}')
})

it('prepend() uses default spaces on only first', () => {
  let css = parse('a {}')
  css.prepend({ selector: 'em' })
  expect(css.toString()).toEqual('em {}\na {}')
})

it('append() sets new line between rules in multiline files', () => {
  let a = parse('a {}\n\na {}\n')
  let b = parse('b {}\n')
  expect(a.append(b).toString()).toEqual('a {}\n\na {}\n\nb {}\n')
})

it('insertAfter() does not use before of first rule', () => {
  let css = parse('a{} b{}')
  css.insertAfter(0, { selector: '.a' })
  css.insertAfter(2, { selector: '.b' })

  expect(css.nodes[1].raws.before).not.toBeDefined()
  expect(css.nodes[3].raws.before).toEqual(' ')
  expect(css.toString()).toEqual('a{} .a{} b{} .b{}')
})

it('fixes spaces on removing first rule', () => {
  let css = parse('a{}\nb{}\n')
  css.first.remove()
  expect(css.toString()).toEqual('b{}\n')
})

it('keeps spaces on moving root', () => {
  let css1 = parse('a{}\nb{}\n')

  let css2 = parse('')
  css2.append(css1)
  expect(css2.toString()).toEqual('a{}\nb{}')

  let css3 = parse('\n')
  css3.append(css2.nodes)
  expect(css3.toString()).toEqual('a{}\nb{}\n')
})

it('generates result with map', () => {
  let root = parse('a {}')
  let result = root.toResult({ map: true })

  expect(result instanceof Result).toBeTruthy()
  expect(result.css).toMatch(/a \{\}\n\/\*# sourceMappingURL=/)
})

it('validateNameTypeNode("decl") => ok', () => {
  let validate = validateNameTypeNode('decl')
  expect(validate).toBeUndefined()
})

it('validateNameTypeNode("decl.exit") => ok', () => {
  let validate = validateNameTypeNode('decl.exit')
  expect(validate).toBeUndefined()
})

it('validateNameTypeNode(123) should throw an error', () => {
  expect(() => { validateNameTypeNode(123) })
    .toThrowError(/must be a string/)
})

it('validateNameTypeNode("decl.abcd") should throw an error', () => {
  expect(() => { validateNameTypeNode('decl.abcd') })
    .toThrowError(/enter/)
})

it('validateNameTypeNode("decl.exit.abcd") should throw an error', () => {
  expect(() => { validateNameTypeNode('decl.exit.abcd') })
    .toThrowError(/enter/)
})

it('normalizeVisitorPlugin("decl") => "decl.enter"', () => {
  let normalize = normalizeVisitorPlugin('decl')

  expect(normalize).toHaveProperty('decl')
  expect(normalize).toHaveProperty('decl.enter')
})

it('normalizeVisitorPlugin("decl.enter") => "decl.enter"', () => {
  let normalize = normalizeVisitorPlugin('decl.enter')

  expect(normalize).toHaveProperty('decl')
  expect(normalize).toHaveProperty('decl.enter')
})

it('normalizeVisitorPlugin("decl.exit") => "decl.exit"', () => {
  let normalize = normalizeVisitorPlugin('decl.exit')

  expect(normalize).toHaveProperty('decl')
  expect(normalize).toHaveProperty('decl.exit')
})

it('buildVisitorObject. Empty listeners', () => {
  let cb = () => {}

  let plugin = {
    decl: {
      enter: cb
    }
  }

  let listeners = {}

  let expected = {
    decl: {
      enter: [cb]
    }
  }

  let result = buildVisitorObject(plugin, listeners)
  expect(result).toEqual(expected)
})

it('buildVisitorObject. Not empty listeners', () => {
  let cb = () => {}

  let plugin = {
    decl: {
      enter: cb
    }
  }

  let listeners = {
    decl: {
      enter: [cb],
      exit: [cb]
    },
    role: {
      exit: [cb]
    }
  }

  let expected = {
    decl: {
      enter: [cb, cb],
      exit: [cb]
    },
    role: {
      exit: [cb]
    }
  }

  let result = buildVisitorObject(plugin, listeners)
  expect(result).toEqual(expected)
})
