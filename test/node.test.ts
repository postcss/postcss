import { resolve } from 'path'

import postcss, {
  AnyNode,
  AtRule,
  Root,
  Rule,
  CssSyntaxError,
  Declaration,
  parse,
  Result,
  Plugin,
  Document
} from '../lib/postcss.js'

function stringify(node: AnyNode, builder: (str: string) => void): void {
  if (node.type === 'rule') {
    builder(node.selector)
  }
}

it('error() generates custom error', () => {
  let file = resolve('a.css')
  let css = parse('a{}', { from: file })
  let a = css.first as Rule
  let error = a.error('Test')
  expect(error instanceof CssSyntaxError).toBe(true)
  expect(error.message).toEqual(file + ':1:1: Test')
})

it('error() generates custom error for nodes without source', () => {
  let rule = new Rule({ selector: 'a' })
  let error = rule.error('Test')
  expect(error.message).toEqual('<css input>: Test')
})

it('error() highlights index', () => {
  let root = parse('a { b: c }')
  let a = root.first as Rule
  let b = a.first as Declaration
  let error = b.error('Bad semicolon', { index: 1 })
  expect(error.showSourceCode(false)).toEqual(
    '> 1 | a { b: c }\n' + '    |      ^'
  )
})

it('error() highlights word', () => {
  let root = parse('a { color: x red }')
  let a = root.first as Rule
  let color = a.first as Declaration
  let error = color.error('Wrong color', { word: 'x' })
  expect(error.showSourceCode(false)).toEqual(
    '> 1 | a { color: x red }\n' + '    |            ^'
  )
})

it('error() highlights word in multiline string', () => {
  let root = parse('a { color: red\n           x }')
  let a = root.first as Rule
  let color = a.first as Declaration
  let error = color.error('Wrong color', { word: 'x' })
  expect(error.showSourceCode(false)).toEqual(
    '  1 | a { color: red\n' + '> 2 |            x }\n' + '    |            ^'
  )
})

it('warn() attaches a warning to the result object', async () => {
  let warning: any
  let warner: Plugin = {
    postcssPlugin: 'warner',
    Once(css, { result }) {
      warning = css.first?.warn(result, 'FIRST!')
    }
  }

  let result = await postcss([warner]).process('a{}', { from: undefined })
  expect(warning.type).toEqual('warning')
  expect(warning.text).toEqual('FIRST!')
  expect(warning.plugin).toEqual('warner')
  expect(result.warnings()).toEqual([warning])
})

it('warn() accepts options', () => {
  let warner = (css: Root, result: Result): void => {
    css.first?.warn(result, 'FIRST!', { index: 1 })
  }

  let result = postcss([warner]).process('a{}')
  expect(result.warnings()).toHaveLength(1)
  let warning = result.warnings()[0] as any
  expect(warning.index).toEqual(1)
})

it('remove() removes node from parent', () => {
  let rule = new Rule({ selector: 'a' })
  let decl = new Declaration({ prop: 'color', value: 'black' })
  rule.append(decl)

  decl.remove()
  expect(rule.nodes).toHaveLength(0)
  expect(decl.parent).not.toBeDefined()
})

it('replaceWith() inserts new node', () => {
  let rule = new Rule({ selector: 'a' })
  rule.append({ prop: 'color', value: 'black' })
  rule.append({ prop: 'width', value: '1px' })
  rule.append({ prop: 'height', value: '1px' })

  let node = new Declaration({ prop: 'min-width', value: '1px' })
  let width = rule.nodes[1]
  let result = width.replaceWith(node)

  expect(result).toEqual(width)
  expect(rule.toString()).toEqual(
    'a {\n' +
      '    color: black;\n' +
      '    min-width: 1px;\n' +
      '    height: 1px\n' +
      '}'
  )
})

it('replaceWith() inserts new root', () => {
  let root = new Root()
  root.append(new AtRule({ name: 'import', params: '"a.css"' }))

  let a = new Root()
  a.append(new Rule({ selector: 'a' }))
  a.append(new Rule({ selector: 'b' }))

  root.first?.replaceWith(a)
  expect(root.toString()).toEqual('a {}\nb {}')
})

it('replaceWith() replaces node', () => {
  let css = parse('a{one:1;two:2}')
  let a = css.first as Rule
  let one = a.first as Declaration
  let result = one.replaceWith({ prop: 'fix', value: 'fixed' })

  expect(result.prop).toEqual('one')
  expect(result.parent).not.toBeDefined()
  expect(css.toString()).toEqual('a{fix:fixed;two:2}')
})

it('replaceWith() can include itself', () => {
  let css = parse('a{one:1;two:2}')
  let a = css.first as Rule
  let one = a.first as Declaration
  let beforeDecl = { prop: 'fix1', value: 'fixedOne' }
  let afterDecl = { prop: 'fix2', value: 'fixedTwo' }
  one.replaceWith(beforeDecl, one, afterDecl)

  expect(css.toString()).toEqual('a{fix1:fixedOne;one:1;fix2:fixedTwo;two:2}')
})

it('toString() accepts custom stringifier', () => {
  expect(new Rule({ selector: 'a' }).toString(stringify)).toEqual('a')
})

it('toString() accepts custom syntax', () => {
  expect(new Rule({ selector: 'a' }).toString({ stringify })).toEqual('a')
})

it('clone() clones nodes', () => {
  let rule = new Rule({ selector: 'a' })
  rule.append({ prop: 'color', value: '/**/black' })

  let clone = rule.clone()

  expect(clone.parent).not.toBeDefined()

  expect(rule.first?.parent).toBe(rule)
  expect(clone.first?.parent).toBe(clone)

  clone.append({ prop: 'z-index', value: '1' })
  expect(rule.nodes).toHaveLength(1)
})

it('clone() overrides properties', () => {
  let rule = new Rule({ selector: 'a' })
  let clone = rule.clone({ selector: 'b' })
  expect(clone.selector).toEqual('b')
})

it('clone() keeps code style', () => {
  let css = parse('@page 1{a{color:black;}}')
  expect(css.clone().toString()).toEqual('@page 1{a{color:black;}}')
})

it('clone() works with null in raws', () => {
  let decl = new Declaration({
    prop: 'color',
    value: 'black',
    // @ts-expect-error
    raws: { value: null }
  })
  let clone = decl.clone()
  expect(Object.keys(clone.raws)).toEqual(['value'])
})

it('cloneBefore() clones and insert before current node', () => {
  let rule = new Rule({ selector: 'a', raws: { after: '' } })
  rule.append({ prop: 'z-index', value: '1', raws: { before: '' } })

  let result = rule.first?.cloneBefore({ value: '2' })

  expect(result).toBe(rule.first)
  expect(rule.toString()).toEqual('a {z-index: 2;z-index: 1}')
})

it('cloneAfter() clones and insert after current node', () => {
  let rule = new Rule({ selector: 'a', raws: { after: '' } })
  rule.append({ prop: 'z-index', value: '1', raws: { before: '' } })

  let result = rule.first?.cloneAfter({ value: '2' })

  expect(result).toBe(rule.last)
  expect(rule.toString()).toEqual('a {z-index: 1;z-index: 2}')
})

it('before() insert before current node', () => {
  let rule = new Rule({ selector: 'a', raws: { after: '' } })
  rule.append({ prop: 'z-index', value: '1', raws: { before: '' } })

  let result = rule.first?.before('color: black')

  expect(result).toBe(rule.last)
  expect(rule.toString()).toEqual('a {color: black;z-index: 1}')
})

it('after() insert after current node', () => {
  let rule = new Rule({ selector: 'a', raws: { after: '' } })
  rule.append({ prop: 'z-index', value: '1', raws: { before: '' } })

  let result = rule.first?.after('color: black')

  expect(result).toBe(rule.first)
  expect(rule.toString()).toEqual('a {z-index: 1;color: black}')
})

it('next() returns next node', () => {
  let css = parse('a{one:1;two:2}')
  let a = css.first as Rule
  expect(a.first?.next()).toBe(a.last)
  expect(a.last?.next()).not.toBeDefined()
})

it('next() returns undefined on no parent', () => {
  let css = parse('')
  expect(css.next()).not.toBeDefined()
})

it('prev() returns previous node', () => {
  let css = parse('a{one:1;two:2}')
  let a = css.first as Rule
  expect(a.last?.prev()).toBe(a.first)
  expect(a.first?.prev()).not.toBeDefined()
})

it('prev() returns undefined on no parent', () => {
  let css = parse('')
  expect(css.prev()).not.toBeDefined()
})

it('toJSON() cleans parents inside', () => {
  let rule = new Rule({ selector: 'a' })
  rule.append({ prop: 'color', value: 'b' })

  let json = rule.toJSON() as any
  expect(json.parent).not.toBeDefined()
  expect(json.nodes[0].parent).not.toBeDefined()

  expect(JSON.stringify(rule)).toEqual(
    '{"raws":{},"selector":"a","type":"rule","nodes":[' +
      '{"raws":{},"prop":"color","value":"b","type":"decl"}' +
      '],"inputs":[]}'
  )
})

it('toJSON() converts custom properties', () => {
  let root = new Root() as any
  root._cache = [1]
  root._hack = {
    toJSON() {
      return 'hack'
    }
  }

  expect(root.toJSON()).toEqual({
    type: 'root',
    nodes: [],
    raws: {},
    _hack: 'hack',
    inputs: [],
    _cache: [1]
  })
})

it('raw() has shortcut to stringifier', () => {
  let rule = new Rule({ selector: 'a' })
  expect(rule.raw('before')).toEqual('')
})

it('root() returns root', () => {
  let css = parse('@page{a{color:black}}')
  let page = css.first as AtRule
  let a = page.first as Rule
  let color = a.first as Declaration
  expect(color.root()).toBe(css)
})

it('root() returns parent of parents', () => {
  let rule = new Rule({ selector: 'a' })
  rule.append({ prop: 'color', value: 'black' })
  expect(rule.first?.root()).toBe(rule)
})

it('root() returns self on root', () => {
  let rule = new Rule({ selector: 'a' })
  expect(rule.root()).toBe(rule)
})

it('root() returns root in document', () => {
  let css = new Document({ nodes: [parse('@page{a{color:black}}')] })

  let root = css.first as Root
  let page = root.first as AtRule
  let a = page.first as Rule
  let color = a.first as Declaration
  expect(color.root()).toBe(root)
})

it('root() on root in document returns same root', () => {
  let document = new Document()
  let root = new Root()
  document.append(root)

  expect(document.first?.root()).toBe(root)
})

it('root() returns self on document', () => {
  let document = new Document()
  expect(document.root()).toBe(document)
})

it('document() returns document', () => {
  let css = new Document({ nodes: [parse('@page{a{color:black}}')] })

  let root = css.first as Root
  let page = root.first as AtRule
  let a = page.first as Rule
  let color = a.first as Declaration
  expect(color.document()).toBe(css)
})

it('document() returns self on root', () => {
  let rule = new Rule({ selector: 'a' })
  expect(rule.document()).toBe(rule)
})

it('document() returns self on document', () => {
  let document = new Document()
  expect(document.document()).toBe(document)
})

it('cleanRaws() cleans style recursivelly', () => {
  let css = parse('@page{a{color:black}}')
  css.cleanRaws()

  expect(css.toString()).toEqual(
    '@page {\n    a {\n        color: black\n    }\n}'
  )
  let page = css.first as AtRule
  let a = page.first as Rule
  let color = a.first as Declaration
  expect(page.raws.before).not.toBeDefined()
  expect(color.raws.before).not.toBeDefined()
  expect(page.raws.between).not.toBeDefined()
  expect(color.raws.between).not.toBeDefined()
  expect(page.raws.after).not.toBeDefined()
})

it('cleanRaws() keeps between on request', () => {
  let css = parse('@page{a{color:black}}')
  css.cleanRaws(true)

  expect(css.toString()).toEqual(
    '@page{\n    a{\n        color:black\n    }\n}'
  )
  let page = css.first as AtRule
  let a = page.first as Rule
  let color = a.first as Declaration
  expect(page.raws.between).toBeDefined()
  expect(color.raws.between).toBeDefined()
  expect(page.raws.before).not.toBeDefined()
  expect(color.raws.before).not.toBeDefined()
  expect(page.raws.after).not.toBeDefined()
})

it('positionInside() returns position when node starts mid-line', () => {
  let css = parse('a {  one: X  }')
  let a = css.first as Rule
  let one = a.first as Declaration
  expect(one.positionInside(6)).toEqual({ line: 1, column: 12 })
})

it('positionInside() returns position when before contains newline', () => {
  let css = parse('a {\n  one: X}')
  let a = css.first as Rule
  let one = a.first as Declaration
  expect(one.positionInside(6)).toEqual({ line: 2, column: 9 })
})

it('positionInside() returns position when node contains newlines', () => {
  let css = parse('a {\n\tone: 1\n\t\tX\n3}')
  let a = css.first as Rule
  let one = a.first as Declaration
  expect(one.positionInside(10)).toEqual({ line: 3, column: 4 })
})
