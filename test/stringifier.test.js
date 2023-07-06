let { test } = require('uvu')
let { is } = require('uvu/assert')

let {
  AtRule,
  Declaration,
  Document,
  Node,
  parse,
  Root,
  Rule
} = require('../lib/postcss')
let Stringifier = require('../lib/stringifier')

let str

test.before.each(() => {
  str = new Stringifier()
})

test('creates trimmed/raw property', () => {
  let b = new Node({ one: 'trim' })
  b.raws.one = { raw: 'raw', value: 'trim' }
  is(str.rawValue(b, 'one'), 'raw')

  b.one = 'trim1'
  is(str.rawValue(b, 'one'), 'trim1')
})

test('works without rawValue magic', () => {
  let b = new Node()
  b.one = '1'
  is(b.one, '1')
  is(str.rawValue(b, 'one'), '1')
})

test('uses node raw', () => {
  let rule = new Rule({ raws: { between: '\n' }, selector: 'a' })
  is(str.raw(rule, 'between', 'beforeOpen'), '\n')
})

test('hacks before for nodes without parent', () => {
  let rule = new Rule({ selector: 'a' })
  is(str.raw(rule, 'before'), '')
})

test('hacks before for first node', () => {
  let root = new Root()
  root.append(new Rule({ selector: 'a' }))
  is(str.raw(root.first, 'before'), '')
})

test('hacks before for first decl', () => {
  let decl = new Declaration({ prop: 'color', value: 'black' })
  is(str.raw(decl, 'before'), '')

  let rule = new Rule({ selector: 'a' })
  rule.append(decl)
  is(str.raw(decl, 'before'), '\n    ')
})

test('detects after raw', () => {
  let root = new Root()
  root.append({ raws: { after: ' ' }, selector: 'a' })
  root.first.append({ prop: 'color', value: 'black' })
  root.append({ selector: 'a' })
  is(str.raw(root.last, 'after'), ' ')
})

test('uses defaults without parent', () => {
  let rule = new Rule({ selector: 'a' })
  is(str.raw(rule, 'between', 'beforeOpen'), ' ')
})

test('uses defaults for unique node', () => {
  let root = new Root()
  root.append(new Rule({ selector: 'a' }))
  is(str.raw(root.first, 'between', 'beforeOpen'), ' ')
})

test('clones raw from first node', () => {
  let root = new Root()
  root.append(new Rule({ raws: { between: '' }, selector: 'a' }))
  root.append(new Rule({ selector: 'b' }))

  is(str.raw(root.last, 'between', 'beforeOpen'), '')
})

test('indents by default', () => {
  let root = new Root()
  root.append(new AtRule({ name: 'page' }))
  root.first.append(new Rule({ selector: 'a' }))
  root.first.first.append({ prop: 'color', value: 'black' })

  is(
    root.toString(),
    '@page {\n' + '    a {\n' + '        color: black\n' + '    }\n' + '}'
  )
})

test('clones style', () => {
  let compress = parse('@page{ a{ } }')
  let spaces = parse('@page {\n  a {\n  }\n}')

  compress.first.first.append({ prop: 'color', value: 'black' })
  is(compress.toString(), '@page{ a{ color: black } }')

  spaces.first.first.append({ prop: 'color', value: 'black' })
  is(spaces.toString(), '@page {\n  a {\n    color: black\n  }\n}')
})

test('clones indent', () => {
  let root = parse('a{\n}')
  root.first.append({ text: 'a' })
  root.first.append({ raws: { before: '\n\n ' }, text: 'b' })
  is(root.toString(), 'a{\n\n /* a */\n\n /* b */\n}')
})

test('clones declaration before for comment', () => {
  let root = parse('a{\n}')
  root.first.append({ text: 'a' })
  root.first.append({
    prop: 'a',
    raws: { before: '\n\n ' },
    value: '1'
  })
  is(root.toString(), 'a{\n\n /* a */\n\n a: 1\n}')
})

test('clones indent by types', () => {
  let css = parse('a {\n  *color: black\n}\n\nb {\n}')
  css.append(new Rule({ selector: 'em' }))
  css.last.append({ prop: 'z-index', value: '1' })
  is(css.last.first.raw('before'), '\n  ')
})

test('ignores non-space symbols in indent cloning', () => {
  let css = parse('a {\n  color: black\n}\n\nb {\n}')
  css.append(new Rule({ selector: 'em' }))
  css.last.append({ prop: 'z-index', value: '1' })

  is(css.last.raw('before'), '\n\n')
  is(css.last.first.raw('before'), '\n  ')
})

test('clones indent by before and after', () => {
  let css = parse('@page{\n\n a{\n  color: black}}')
  css.first.append(new Rule({ selector: 'b' }))
  css.first.last.append({ prop: 'z-index', value: '1' })

  is(css.first.last.raw('before'), '\n\n ')
  is(css.first.last.raw('after'), '')
})

test('clones semicolon only from rules with children', () => {
  let css = parse('a{}b{one:1;}')
  is(str.raw(css.first, 'semicolon'), true)
})

test('clones only spaces in before', () => {
  let css = parse('a{*one:1}')
  css.first.append({ prop: 'two', value: '2' })
  css.append({ name: 'keyframes', params: 'a' })
  css.last.append({ selector: 'from' })
  is(css.toString(), 'a{*one:1;two:2}\n@keyframes a{\nfrom{}}')
})

test('clones only spaces in between', () => {
  let css = parse('a{one/**/:1}')
  css.first.append({ prop: 'two', value: '2' })
  is(css.toString(), 'a{one/**/:1;two:2}')
})

test('uses optional raws.indent', () => {
  let rule = new Rule({ raws: { indent: ' ' }, selector: 'a' })
  rule.append({ prop: 'color', value: 'black' })
  is(rule.toString(), 'a {\n color: black\n}')
})

test('handles nested roots', () => {
  let root = new Root()
  let subRoot = new Root()
  subRoot.append(new AtRule({ name: 'foo' }))
  root.append(subRoot)

  is(root.toString(), '@foo')
})

test('handles root', () => {
  let root = new Root()
  root.append(new AtRule({ name: 'foo' }))

  let s = root.toString()

  is(s, '@foo')
})

test('handles root with after', () => {
  let root = new Root({ raws: { after: '   ' } })
  root.append(new AtRule({ name: 'foo' }))

  let s = root.toString()

  is(s, '@foo   ')
})

test('pass nodes to document', () => {
  let root = new Root()
  let document = new Document({ nodes: [root] })

  is(document.toString(), '')
})

test('handles document with one root', () => {
  let root = new Root()
  root.append(new AtRule({ name: 'foo' }))

  let document = new Document()
  document.append(root)

  let s = document.toString()

  is(s, '@foo')
})

test('handles document with one root and after raw', () => {
  let document = new Document()
  let root = new Root({ raws: { after: '   ' } })
  root.append(new AtRule({ name: 'foo' }))
  document.append(root)

  let s = document.toString()

  is(s, '@foo   ')
})

test('handles document with one root and before and after', () => {
  let document = new Document()
  let root = new Root({ raws: { after: 'AFTER' } })
  root.append(new AtRule({ name: 'foo' }))
  document.append(root)

  let s = document.toString()

  is(s, '@fooAFTER')
})

test('handles document with three roots without raws', () => {
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

  is(s, '@fooa {}color: black')
})

test('handles document with three roots, with before and after raws', () => {
  let root1 = new Root({ raws: { after: 'AFTER_ONE' } })
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

  is(s, 'a.one {}AFTER_ONEa.two {}AFTER_TWOa.three {}AFTER_THREE')
})

test.run()
