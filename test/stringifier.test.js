const Stringifier = require('../lib/stringifier')
const Declaration = require('../lib/declaration')
const AtRule = require('../lib/at-rule')
const parse = require('../lib/parse')
const Node = require('../lib/node')
const Root = require('../lib/root')
const Rule = require('../lib/rule')

let str
beforeAll(() => {
  str = new Stringifier()
})

it('creates trimmed/raw property', () => {
  const b = new Node({ one: 'trim' })
  b.raws.one = { value: 'trim', raw: 'raw' }
  expect(str.rawValue(b, 'one')).toEqual('raw')

  b.one = 'trim1'
  expect(str.rawValue(b, 'one')).toEqual('trim1')
})

it('works without rawValue magic', () => {
  const b = new Node()
  b.one = '1'
  expect(b.one).toEqual('1')
  expect(str.rawValue(b, 'one')).toEqual('1')
})

it('uses node raw', () => {
  const rule = new Rule({ selector: 'a', raws: { between: '\n' } })
  expect(str.raw(rule, 'between', 'beforeOpen')).toEqual('\n')
})

it('hacks before for nodes without parent', () => {
  const rule = new Rule({ selector: 'a' })
  expect(str.raw(rule, 'before')).toEqual('')
})

it('hacks before for first node', () => {
  const root = new Root()
  root.append(new Rule({ selector: 'a' }))
  expect(str.raw(root.first, 'before')).toEqual('')
})

it('hacks before for first decl', () => {
  const decl = new Declaration({ prop: 'color', value: 'black' })
  expect(str.raw(decl, 'before')).toEqual('')

  const rule = new Rule({ selector: 'a' })
  rule.append(decl)
  expect(str.raw(decl, 'before')).toEqual('\n    ')
})

it('detects after raw', () => {
  const root = new Root()
  root.append({ selector: 'a', raws: { after: ' ' } })
  root.first.append({ prop: 'color', value: 'black' })
  root.append({ selector: 'a' })
  expect(str.raw(root.last, 'after')).toEqual(' ')
})

it('uses defaults without parent', () => {
  const rule = new Rule({ selector: 'a' })
  expect(str.raw(rule, 'between', 'beforeOpen')).toEqual(' ')
})

it('uses defaults for unique node', () => {
  const root = new Root()
  root.append(new Rule({ selector: 'a' }))
  expect(str.raw(root.first, 'between', 'beforeOpen')).toEqual(' ')
})

it('clones raw from first node', () => {
  const root = new Root()
  root.append(new Rule({ selector: 'a', raws: { between: '' } }))
  root.append(new Rule({ selector: 'b' }))

  expect(str.raw(root.last, 'between', 'beforeOpen')).toEqual('')
})

it('indents by default', () => {
  const root = new Root()
  root.append(new AtRule({ name: 'page' }))
  root.first.append(new Rule({ selector: 'a' }))
  root.first.first.append({ prop: 'color', value: 'black' })

  expect(root.toString()).toEqual('@page {\n' +
                                  '    a {\n' +
                                  '        color: black\n' +
                                  '    }\n' +
                                  '}')
})

it('clones style', () => {
  const compress = parse('@page{ a{ } }')
  const spaces = parse('@page {\n  a {\n  }\n}')

  compress.first.first.append({ prop: 'color', value: 'black' })
  expect(compress.toString()).toEqual('@page{ a{ color: black } }')

  spaces.first.first.append({ prop: 'color', value: 'black' })
  expect(spaces.toString())
    .toEqual('@page {\n  a {\n    color: black\n  }\n}')
})

it('clones indent', () => {
  const root = parse('a{\n}')
  root.first.append({ text: 'a' })
  root.first.append({ text: 'b', raws: { before: '\n\n ' } })
  expect(root.toString()).toEqual('a{\n\n /* a */\n\n /* b */\n}')
})

it('clones declaration before for comment', () => {
  const root = parse('a{\n}')
  root.first.append({ text: 'a' })
  root.first.append({
    prop: 'a',
    value: '1',
    raws: { before: '\n\n ' }
  })
  expect(root.toString()).toEqual('a{\n\n /* a */\n\n a: 1\n}')
})

it('clones indent by types', () => {
  const css = parse('a {\n  *color: black\n}\n\nb {\n}')
  css.append(new Rule({ selector: 'em' }))
  css.last.append({ prop: 'z-index', value: '1' })
  expect(css.last.first.raw('before')).toEqual('\n  ')
})

it('ignores non-space symbols in indent cloning', () => {
  const css = parse('a {\n  color: black\n}\n\nb {\n}')
  css.append(new Rule({ selector: 'em' }))
  css.last.append({ prop: 'z-index', value: '1' })

  expect(css.last.raw('before')).toEqual('\n\n')
  expect(css.last.first.raw('before')).toEqual('\n  ')
})

it('clones indent by before and after', () => {
  const css = parse('@page{\n\n a{\n  color: black}}')
  css.first.append(new Rule({ selector: 'b' }))
  css.first.last.append({ prop: 'z-index', value: '1' })

  expect(css.first.last.raw('before')).toEqual('\n\n ')
  expect(css.first.last.raw('after')).toEqual('')
})

it('clones semicolon only from rules with children', () => {
  const css = parse('a{}b{one:1;}')
  expect(str.raw(css.first, 'semicolon')).toBeTruthy()
})

it('clones only spaces in before', () => {
  const css = parse('a{*one:1}')
  css.first.append({ prop: 'two', value: '2' })
  css.append({ name: 'keyframes', params: 'a' })
  css.last.append({ selector: 'from' })
  expect(css.toString()).toEqual('a{*one:1;two:2}\n@keyframes a{\nfrom{}}')
})

it('clones only spaces in between', () => {
  const css = parse('a{one/**/:1}')
  css.first.append({ prop: 'two', value: '2' })
  expect(css.toString()).toEqual('a{one/**/:1;two:2}')
})

it('uses optional raws.indent', () => {
  const rule = new Rule({ selector: 'a', raws: { indent: ' ' } })
  rule.append({ prop: 'color', value: 'black' })
  expect(rule.toString()).toEqual('a {\n color: black\n}')
})
