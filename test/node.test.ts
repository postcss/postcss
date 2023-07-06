import { resolve } from 'path'
import { test } from 'uvu'
import { equal, is, not, type } from 'uvu/assert'

import postcss, {
  AnyNode,
  AtRule,
  CssSyntaxError,
  Declaration,
  Document,
  parse,
  Plugin,
  Result,
  Root,
  Rule
} from '../lib/postcss.js'

function stringify(node: AnyNode, builder: (str: string) => void): void {
  if (node.type === 'rule') {
    builder(node.selector)
  }
}

test('error() generates custom error', () => {
  let file = resolve('a.css')
  let css = parse('a{}', { from: file })
  let a = css.first as Rule
  let error = a.error('Test')
  is(error instanceof CssSyntaxError, true)
  is(error.message, file + ':1:1: Test')
})

test('error() generates custom error for nodes without source', () => {
  let rule = new Rule({ selector: 'a' })
  let error = rule.error('Test')
  is(error.message, '<css input>: Test')
})

test('error() highlights index', () => {
  let root = parse('a { b: c }')
  let a = root.first as Rule
  let b = a.first as Declaration
  let error = b.error('Bad semicolon', { index: 1 })
  is(error.showSourceCode(false), '> 1 | a { b: c }\n' + '    |      ^')
})

test('error() highlights word', () => {
  let root = parse('a { color: x red }')
  let a = root.first as Rule
  let color = a.first as Declaration
  let error = color.error('Wrong color', { word: 'x' })
  is(
    error.showSourceCode(false),
    '> 1 | a { color: x red }\n' + '    |            ^'
  )
})

test('error() highlights word in multiline string', () => {
  let root = parse('a { color: red\n           x }')
  let a = root.first as Rule
  let color = a.first as Declaration
  let error = color.error('Wrong color', { word: 'x' })
  is(
    error.showSourceCode(false),
    '  1 | a { color: red\n' + '> 2 |            x }\n' + '    |            ^'
  )
})

test('warn() attaches a warning to the result object', async () => {
  let warning: any
  let warner: Plugin = {
    Once(css, { result }) {
      warning = css.first?.warn(result, 'FIRST!')
    },
    postcssPlugin: 'warner'
  }

  let result = await postcss([warner]).process('a{}', { from: undefined })
  is(warning.type, 'warning')
  is(warning.text, 'FIRST!')
  is(warning.plugin, 'warner')
  equal(result.warnings(), [warning])
})

test('warn() accepts options', () => {
  let warner = (css: Root, result: Result): void => {
    css.first?.warn(result, 'FIRST!', { index: 1 })
  }

  let result = postcss([warner]).process('a{}')
  is(result.warnings().length, 1)
  let warning = result.warnings()[0] as any
  is(warning.index, 1)
})

test('remove() removes node from parent', () => {
  let rule = new Rule({ selector: 'a' })
  let decl = new Declaration({ prop: 'color', value: 'black' })
  rule.append(decl)

  decl.remove()
  is(rule.nodes.length, 0)
  type(decl.parent, 'undefined')
})

test('replaceWith() inserts new node', () => {
  let rule = new Rule({ selector: 'a' })
  rule.append({ prop: 'color', value: 'black' })
  rule.append({ prop: 'width', value: '1px' })
  rule.append({ prop: 'height', value: '1px' })

  let node = new Declaration({ prop: 'min-width', value: '1px' })
  let width = rule.nodes[1]
  let result = width.replaceWith(node)

  equal(result, width)
  is(
    rule.toString(),
    'a {\n' +
      '    color: black;\n' +
      '    min-width: 1px;\n' +
      '    height: 1px\n' +
      '}'
  )
})

test('replaceWith() inserts new root', () => {
  let root = new Root()
  root.append(new AtRule({ name: 'import', params: '"a.css"' }))

  let a = new Root()
  a.append(new Rule({ selector: 'a' }))
  a.append(new Rule({ selector: 'b' }))

  root.first?.replaceWith(a)
  is(root.toString(), 'a {}\nb {}')
})

test('replaceWith() replaces node', () => {
  let css = parse('a{one:1;two:2}')
  let a = css.first as Rule
  let one = a.first as Declaration
  let result = one.replaceWith({ prop: 'fix', value: 'fixed' })

  is(result.prop, 'one')
  type(result.parent, 'undefined')
  is(css.toString(), 'a{fix:fixed;two:2}')
})

test('replaceWith() can include itself', () => {
  let css = parse('a{one:1;two:2}')
  let a = css.first as Rule
  let one = a.first as Declaration
  let beforeDecl = { prop: 'fix1', value: 'fixedOne' }
  let afterDecl = { prop: 'fix2', value: 'fixedTwo' }
  one.replaceWith(beforeDecl, one, afterDecl)

  is(css.toString(), 'a{fix1:fixedOne;one:1;fix2:fixedTwo;two:2}')
})

test('toString() accepts custom stringifier', () => {
  is(new Rule({ selector: 'a' }).toString(stringify), 'a')
})

test('toString() accepts custom syntax', () => {
  is(new Rule({ selector: 'a' }).toString({ stringify }), 'a')
})

test('assign() assigns to node', () => {
  let decl = new Declaration({ prop: 'white-space', value: 'overflow-wrap' })

  is(decl.prop, 'white-space')
  is(decl.value, 'overflow-wrap')

  decl.assign({ prop: 'word-wrap', value: 'break-word' })

  is(decl.prop, 'word-wrap')
  is(decl.value, 'break-word')
})

test('clone() clones nodes', () => {
  let rule = new Rule({ selector: 'a' })
  rule.append({ prop: 'color', value: '/**/black' })

  let clone = rule.clone()

  type(clone.parent, 'undefined')

  equal(rule.first?.parent, rule)
  equal(clone.first?.parent, clone)

  clone.append({ prop: 'z-index', value: '1' })
  is(rule.nodes.length, 1)
})

test('clone() overrides properties', () => {
  let rule = new Rule({ selector: 'a' })
  let clone = rule.clone({ selector: 'b' })
  is(clone.selector, 'b')
})

test('clone() keeps code style', () => {
  let css = parse('@page 1{a{color:black;}}')
  is(css.clone().toString(), '@page 1{a{color:black;}}')
})

test('clone() works with null in raws', () => {
  let decl = new Declaration({
    prop: 'color',
    // @ts-expect-error
    raws: { value: null },
    value: 'black'
  })
  let clone = decl.clone()
  equal(Object.keys(clone.raws), ['value'])
})

test('cloneBefore() clones and insert before current node', () => {
  let rule = new Rule({ raws: { after: '' }, selector: 'a' })
  rule.append({ prop: 'z-index', raws: { before: '' }, value: '1' })

  let result = rule.first?.cloneBefore({ value: '2' })

  equal(result, rule.first)
  is(rule.toString(), 'a {z-index: 2;z-index: 1}')
})

test('cloneAfter() clones and insert after current node', () => {
  let rule = new Rule({ raws: { after: '' }, selector: 'a' })
  rule.append({ prop: 'z-index', raws: { before: '' }, value: '1' })

  let result = rule.first?.cloneAfter({ value: '2' })

  equal(result, rule.last)
  is(rule.toString(), 'a {z-index: 1;z-index: 2}')
})

test('before() insert before current node', () => {
  let rule = new Rule({ raws: { after: '' }, selector: 'a' })
  rule.append({ prop: 'z-index', raws: { before: '' }, value: '1' })

  let result = rule.first?.before('color: black')

  equal(result, rule.last)
  is(rule.toString(), 'a {color: black;z-index: 1}')
})

test('after() insert after current node', () => {
  let rule = new Rule({ raws: { after: '' }, selector: 'a' })
  rule.append({ prop: 'z-index', raws: { before: '' }, value: '1' })

  let result = rule.first?.after('color: black')

  equal(result, rule.first)
  is(rule.toString(), 'a {z-index: 1;color: black}')
})

test('next() returns next node', () => {
  let css = parse('a{one:1;two:2}')
  let a = css.first as Rule
  equal(a.first?.next(), a.last)
  type(a.last?.next(), 'undefined')
})

test('next() returns undefined on no parent', () => {
  let css = parse('')
  type(css.next(), 'undefined')
})

test('prev() returns previous node', () => {
  let css = parse('a{one:1;two:2}')
  let a = css.first as Rule
  equal(a.last?.prev(), a.first)
  type(a.first?.prev(), 'undefined')
})

test('prev() returns undefined on no parent', () => {
  let css = parse('')
  type(css.prev(), 'undefined')
})

test('toJSON() cleans parents inside', () => {
  let rule = new Rule({ selector: 'a' })
  rule.append({ prop: 'color', value: 'b' })

  let json = rule.toJSON() as any
  type(json.parent, 'undefined')
  type(json.nodes[0].parent, 'undefined')

  is(
    JSON.stringify(rule),
    '{"raws":{},"selector":"a","type":"rule","nodes":[' +
      '{"raws":{},"prop":"color","value":"b","type":"decl"}' +
      '],"inputs":[]}'
  )
})

test('toJSON() converts custom properties', () => {
  let root = new Root() as any
  root._cache = [1]
  root._hack = {
    toJSON() {
      return 'hack'
    }
  }

  equal(root.toJSON(), {
    _cache: [1],
    _hack: 'hack',
    inputs: [],
    nodes: [],
    raws: {},
    type: 'root'
  })
})

test('raw() has shortcut to stringifier', () => {
  let rule = new Rule({ selector: 'a' })
  is(rule.raw('before'), '')
})

test('root() returns root', () => {
  let css = parse('@page{a{color:black}}')
  let page = css.first as AtRule
  let a = page.first as Rule
  let color = a.first as Declaration
  equal(color.root(), css)
})

test('root() returns parent of parents', () => {
  let rule = new Rule({ selector: 'a' })
  rule.append({ prop: 'color', value: 'black' })
  equal(rule.first?.root(), rule)
})

test('root() returns self on root', () => {
  let rule = new Rule({ selector: 'a' })
  equal(rule.root(), rule)
})

test('root() returns root in document', () => {
  let css = new Document({ nodes: [parse('@page{a{color:black}}')] })

  let root = css.first as Root
  let page = root.first as AtRule
  let a = page.first as Rule
  let color = a.first as Declaration
  equal(color.root(), root)
})

test('root() on root in document returns same root', () => {
  let document = new Document()
  let root = new Root()
  document.append(root)

  equal(document.first?.root(), root)
})

test('root() returns self on document', () => {
  let document = new Document()
  equal(document.root(), document)
})

test('cleanRaws() cleans style recursivelly', () => {
  let css = parse('@page{a{color:black}}')
  css.cleanRaws()

  is(css.toString(), '@page {\n    a {\n        color: black\n    }\n}')
  let page = css.first as AtRule
  let a = page.first as Rule
  let color = a.first as Declaration
  type(page.raws.before, 'undefined')
  type(color.raws.before, 'undefined')
  type(page.raws.between, 'undefined')
  type(color.raws.between, 'undefined')
  type(page.raws.after, 'undefined')
})

test('cleanRaws() keeps between on request', () => {
  let css = parse('@page{a{color:black}}')
  css.cleanRaws(true)

  is(css.toString(), '@page{\n    a{\n        color:black\n    }\n}')
  let page = css.first as AtRule
  let a = page.first as Rule
  let color = a.first as Declaration
  not.type(page.raws.between, 'undefined')
  not.type(color.raws.between, 'undefined')
  type(page.raws.before, 'undefined')
  type(color.raws.before, 'undefined')
  type(page.raws.after, 'undefined')
})

test('positionInside() returns position when node starts mid-line', () => {
  let css = parse('a {  one: X  }')
  let a = css.first as Rule
  let one = a.first as Declaration
  equal(one.positionInside(6), { column: 12, line: 1 })
})

test('positionInside() returns position when before contains newline', () => {
  let css = parse('a {\n  one: X}')
  let a = css.first as Rule
  let one = a.first as Declaration
  equal(one.positionInside(6), { column: 9, line: 2 })
})

test('positionInside() returns position when node contains newlines', () => {
  let css = parse('a {\n\tone: 1\n\t\tX\n3}')
  let a = css.first as Rule
  let one = a.first as Declaration
  equal(one.positionInside(10), { column: 4, line: 3 })
})

test('positionBy() returns position for word', () => {
  let css = parse('a {  one: X  }')
  let a = css.first as Rule
  let one = a.first as Declaration
  equal(one.positionBy({ word: 'one' }), { column: 6, line: 1 })
})

test('positionBy() returns position for index', () => {
  let css = parse('a {  one: X  }')
  let a = css.first as Rule
  let one = a.first as Declaration
  equal(one.positionBy({ index: 1 }), { column: 7, line: 1 })
})

test('rangeBy() returns range for word', () => {
  let css = parse('a {  one: X  }')
  let a = css.first as Rule
  let one = a.first as Declaration
  equal(one.rangeBy({ word: 'one' }), {
    end: { column: 9, line: 1 },
    start: { column: 6, line: 1 }
  })
})

test('rangeBy() returns range for index and endIndex', () => {
  let css = parse('a {  one: X  }')
  let a = css.first as Rule
  let one = a.first as Declaration
  equal(one.rangeBy({ endIndex: 3, index: 1 }), {
    end: { column: 9, line: 1 },
    start: { column: 7, line: 1 }
  })
})

test.run()
