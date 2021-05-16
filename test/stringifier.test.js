let { Declaration, AtRule, Node, Root, Rule, Document, parse } = require('..')
let Stringifier = require('../lib/stringifier')

let str
beforeAll(() => {
  str = new Stringifier()
})

it('creates trimmed/raw property', () => {
  let b = new Node({ one: 'trim' })
  b.raws.one = { value: 'trim', raw: 'raw' }
  expect(str.rawValue(b, 'one')).toEqual('raw')

  b.one = 'trim1'
  expect(str.rawValue(b, 'one')).toEqual('trim1')
})

it('works without rawValue magic', () => {
  let b = new Node()
  b.one = '1'
  expect(b.one).toEqual('1')
  expect(str.rawValue(b, 'one')).toEqual('1')
})

it('uses node raw', () => {
  let rule = new Rule({ selector: 'a', raws: { between: '\n' } })
  expect(str.raw(rule, 'between', 'beforeOpen')).toEqual('\n')
})

it('hacks before for nodes without parent', () => {
  let rule = new Rule({ selector: 'a' })
  expect(str.raw(rule, 'before')).toEqual('')
})

it('hacks before for first node', () => {
  let root = new Root()
  root.append(new Rule({ selector: 'a' }))
  expect(str.raw(root.first, 'before')).toEqual('')
})

it('hacks before for first decl', () => {
  let decl = new Declaration({ prop: 'color', value: 'black' })
  expect(str.raw(decl, 'before')).toEqual('')

  let rule = new Rule({ selector: 'a' })
  rule.append(decl)
  expect(str.raw(decl, 'before')).toEqual('\n    ')
})

it('detects after raw', () => {
  let root = new Root()
  root.append({ selector: 'a', raws: { after: ' ' } })
  root.first.append({ prop: 'color', value: 'black' })
  root.append({ selector: 'a' })
  expect(str.raw(root.last, 'after')).toEqual(' ')
})

it('uses defaults without parent', () => {
  let rule = new Rule({ selector: 'a' })
  expect(str.raw(rule, 'between', 'beforeOpen')).toEqual(' ')
})

it('uses defaults for unique node', () => {
  let root = new Root()
  root.append(new Rule({ selector: 'a' }))
  expect(str.raw(root.first, 'between', 'beforeOpen')).toEqual(' ')
})

it('clones raw from first node', () => {
  let root = new Root()
  root.append(new Rule({ selector: 'a', raws: { between: '' } }))
  root.append(new Rule({ selector: 'b' }))

  expect(str.raw(root.last, 'between', 'beforeOpen')).toEqual('')
})

it('indents by default', () => {
  let root = new Root()
  root.append(new AtRule({ name: 'page' }))
  root.first.append(new Rule({ selector: 'a' }))
  root.first.first.append({ prop: 'color', value: 'black' })

  expect(root.toString()).toEqual(
    '@page {\n' + '    a {\n' + '        color: black\n' + '    }\n' + '}'
  )
})

it('clones style', () => {
  let compress = parse('@page{ a{ } }')
  let spaces = parse('@page {\n  a {\n  }\n}')

  compress.first.first.append({ prop: 'color', value: 'black' })
  expect(compress.toString()).toEqual('@page{ a{ color: black } }')

  spaces.first.first.append({ prop: 'color', value: 'black' })
  expect(spaces.toString()).toEqual('@page {\n  a {\n    color: black\n  }\n}')
})

it('clones indent', () => {
  let root = parse('a{\n}')
  root.first.append({ text: 'a' })
  root.first.append({ text: 'b', raws: { before: '\n\n ' } })
  expect(root.toString()).toEqual('a{\n\n /* a */\n\n /* b */\n}')
})

it('clones declaration before for comment', () => {
  let root = parse('a{\n}')
  root.first.append({ text: 'a' })
  root.first.append({
    prop: 'a',
    value: '1',
    raws: { before: '\n\n ' }
  })
  expect(root.toString()).toEqual('a{\n\n /* a */\n\n a: 1\n}')
})

it('clones indent by types', () => {
  let css = parse('a {\n  *color: black\n}\n\nb {\n}')
  css.append(new Rule({ selector: 'em' }))
  css.last.append({ prop: 'z-index', value: '1' })
  expect(css.last.first.raw('before')).toEqual('\n  ')
})

it('ignores non-space symbols in indent cloning', () => {
  let css = parse('a {\n  color: black\n}\n\nb {\n}')
  css.append(new Rule({ selector: 'em' }))
  css.last.append({ prop: 'z-index', value: '1' })

  expect(css.last.raw('before')).toEqual('\n\n')
  expect(css.last.first.raw('before')).toEqual('\n  ')
})

it('clones indent by before and after', () => {
  let css = parse('@page{\n\n a{\n  color: black}}')
  css.first.append(new Rule({ selector: 'b' }))
  css.first.last.append({ prop: 'z-index', value: '1' })

  expect(css.first.last.raw('before')).toEqual('\n\n ')
  expect(css.first.last.raw('after')).toEqual('')
})

it('clones semicolon only from rules with children', () => {
  let css = parse('a{}b{one:1;}')
  expect(str.raw(css.first, 'semicolon')).toBe(true)
})

it('clones only spaces in before', () => {
  let css = parse('a{*one:1}')
  css.first.append({ prop: 'two', value: '2' })
  css.append({ name: 'keyframes', params: 'a' })
  css.last.append({ selector: 'from' })
  expect(css.toString()).toEqual('a{*one:1;two:2}\n@keyframes a{\nfrom{}}')
})

it('clones only spaces in between', () => {
  let css = parse('a{one/**/:1}')
  css.first.append({ prop: 'two', value: '2' })
  expect(css.toString()).toEqual('a{one/**/:1;two:2}')
})

it('uses optional raws.indent', () => {
  let rule = new Rule({ selector: 'a', raws: { indent: ' ' } })
  rule.append({ prop: 'color', value: 'black' })
  expect(rule.toString()).toEqual('a {\n color: black\n}')
})

it('handles nested roots', () => {
  let root = new Root()
  let subRoot = new Root()
  subRoot.append(new AtRule({ name: 'foo' }))
  root.append(subRoot)

  expect(root.toString()).toEqual('@foo')
})

it('handles root', () => {
  let root = new Root()
  root.append(new AtRule({ name: 'foo' }))

  let s = root.toString()

  expect(s).toEqual('@foo')
})

it('handles root with after', () => {
  let root = new Root({ raws: { after: '   ' } })
  root.append(new AtRule({ name: 'foo' }))

  let s = root.toString()

  expect(s).toEqual('@foo   ')
})

it('pass nodes to document', () => {
  let root = new Root()
  let document = new Document({ nodes: [root] })

  expect(document.toString()).toEqual('')
})

it('handles document with one root', () => {
  let root = new Root()
  root.append(new AtRule({ name: 'foo' }))

  let document = new Document()
  document.append(root)

  let s = document.toString()

  expect(s).toEqual('@foo')
})

it('handles document with one root and after raw', () => {
  let document = new Document()
  let root = new Root({ raws: { after: '   ' } })
  root.append(new AtRule({ name: 'foo' }))
  document.append(root)

  let s = document.toString()

  expect(s).toEqual('@foo   ')
})

it('handles document with one root and before raw', () => {
  let document = new Document()
  let root = new Root({ raws: { before: '   ' } })
  root.append(new AtRule({ name: 'foo' }))
  document.append(root)

  let s = document.toString()

  expect(s).toEqual('   @foo')
})

it('handles document with one root and before and after', () => {
  let document = new Document()
  let root = new Root({ raws: { before: 'BEFORE', after: 'AFTER' } })
  root.append(new AtRule({ name: 'foo' }))
  document.append(root)

  let s = document.toString()

  expect(s).toEqual('BEFORE@fooAFTER')
})

it('handles document with three roots without raws', () => {
  let root1 = new Root()
  root1.append(new AtRule({ name: 'foo' }))

  let root2 = new Root()
  root2.append(new Rule({ selector: 'a' }))

  let root3 = new Root()
  root3.append(new Declaration({ prop: 'color', value: 'black' }))

  let document = new Document()
  document.append(root1)
  document.append(root2)
  document.append(root3)

  let s = document.toString()

  expect(s).toEqual('@fooa {}color: black')
})

it('handles document with three roots, with before and after raws', () => {
  let root1 = new Root({ raws: { before: 'BEFORE_ONE', after: 'AFTER_ONE' } })
  root1.append(new Rule({ selector: 'a.one' }))

  let root2 = new Root({ raws: { after: 'AFTER_TWO' } })
  root2.append(new Rule({ selector: 'a.two' }))

  let root3 = new Root({ raws: { after: 'AFTER_THREE' } })
  root3.append(new Rule({ selector: 'a.three' }))

  let document = new Document()
  document.append(root1)
  document.append(root2)
  document.append(root3)

  let s = document.toString()

  expect(s).toEqual(
    'BEFORE_ONEa.one {}AFTER_ONEa.two {}AFTER_TWOa.three {}AFTER_THREE'
  )
})
