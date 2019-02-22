let CssSyntaxError = require('../lib/css-syntax-error')
let Declaration = require('../lib/declaration')
let postcss = require('../lib/postcss')
let AtRule = require('../lib/at-rule')
let parse = require('../lib/parse')
let Root = require('../lib/root').default
let Rule = require('../lib/rule')

let path = require('path')

function stringify (node, builder) {
  return builder(node.selector)
}

it('shows error on wrong constructor types', () => {
  expect(() => {
    new Rule('a')
  }).toThrowError('PostCSS nodes constructor accepts object, not "a"')
})

it('error() generates custom error', () => {
  let file = path.resolve('a.css')
  let css = parse('a{}', { from: file })
  let error = css.first.error('Test')
  expect(error instanceof CssSyntaxError).toBeTruthy()
  expect(error.message).toEqual(file + ':1:1: Test')
})

it('error() generates custom error for nodes without source', () => {
  let rule = new Rule({ selector: 'a' })
  let error = rule.error('Test')
  expect(error.message).toEqual('<css input>: Test')
})

it('error() highlights index', () => {
  let root = parse('a { b: c }')
  let error = root.first.first.error('Bad semicolon', { index: 1 })
  expect(error.showSourceCode(false)).toEqual('> 1 | a { b: c }\n' +
                                             '    |      ^')
})

it('error() highlights word', () => {
  let root = parse('a { color: x red }')
  let error = root.first.first.error('Wrong color', { word: 'x' })
  expect(error.showSourceCode(false)).toEqual('> 1 | a { color: x red }\n' +
                                             '    |            ^')
})

it('error() highlights word in multiline string', () => {
  let root = parse('a { color: red\n           x }')
  let error = root.first.first.error('Wrong color', { word: 'x' })
  expect(error.showSourceCode(false)).toEqual('  1 | a { color: red\n' +
                                             '> 2 |            x }\n' +
                                             '    |            ^')
})

it('warn() attaches a warning to the result object', () => {
  let warning
  let warner = postcss.plugin('warner', () => {
    return (css, result) => {
      warning = css.first.warn(result, 'FIRST!')
    }
  })

  return postcss([warner]).process('a{}', { from: undefined }).then(result => {
    expect(warning.type).toEqual('warning')
    expect(warning.text).toEqual('FIRST!')
    expect(warning.plugin).toEqual('warner')
    expect(result.warnings()).toEqual([warning])
  })
})

it('warn() accepts options', () => {
  let warner = postcss.plugin('warner', () => {
    return (css, result) => {
      css.first.warn(result, 'FIRST!', { index: 1 })
    }
  })

  let result = postcss([warner()]).process('a{}')
  expect(result.warnings()).toHaveLength(1)
  expect(result.warnings()[0].index).toEqual(1)
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
  expect(rule.toString()).toEqual('a {\n' +
                                  '    color: black;\n' +
                                  '    min-width: 1px;\n' +
                                  '    height: 1px\n' +
                                  '}')
})

it('replaceWith() inserts new root', () => {
  let root = new Root()
  root.append(new AtRule({ name: 'import', params: '"a.css"' }))

  let a = new Root()
  a.append(new Rule({ selector: 'a' }))
  a.append(new Rule({ selector: 'b' }))

  root.first.replaceWith(a)
  expect(root.toString()).toEqual('a {}\nb {}')
})

it('replaceWith() replaces node', () => {
  let css = parse('a{one:1;two:2}')
  let decl = { prop: 'fix', value: 'fixed' }
  let result = css.first.first.replaceWith(decl)

  expect(result.prop).toEqual('one')
  expect(result.parent).not.toBeDefined()
  expect(css.toString()).toEqual('a{fix:fixed;two:2}')
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

  expect(rule.first.parent).toBe(rule)
  expect(clone.first.parent).toBe(clone)

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
    raws: { value: null }
  })
  let clone = decl.clone()
  expect(Object.keys(clone.raws)).toEqual(['value'])
})

it('cloneBefore() clones and insert before current node', () => {
  let rule = new Rule({ selector: 'a', raws: { after: '' } })
  rule.append({ prop: 'z-index', value: '1', raws: { before: '' } })

  let result = rule.first.cloneBefore({ value: '2' })

  expect(result).toBe(rule.first)
  expect(rule.toString()).toEqual('a {z-index: 2;z-index: 1}')
})

it('cloneAfter() clones and insert after current node', () => {
  let rule = new Rule({ selector: 'a', raws: { after: '' } })
  rule.append({ prop: 'z-index', value: '1', raws: { before: '' } })

  let result = rule.first.cloneAfter({ value: '2' })

  expect(result).toBe(rule.last)
  expect(rule.toString()).toEqual('a {z-index: 1;z-index: 2}')
})

it('before() insert before current node', () => {
  let rule = new Rule({ selector: 'a', raws: { after: '' } })
  rule.append({ prop: 'z-index', value: '1', raws: { before: '' } })

  let result = rule.first.before('color: black')

  expect(result).toBe(rule.last)
  expect(rule.toString()).toEqual('a {color: black;z-index: 1}')
})

it('after() insert after current node', () => {
  let rule = new Rule({ selector: 'a', raws: { after: '' } })
  rule.append({ prop: 'z-index', value: '1', raws: { before: '' } })

  let result = rule.first.after('color: black')

  expect(result).toBe(rule.first)
  expect(rule.toString()).toEqual('a {z-index: 1;color: black}')
})

it('next() returns next node', () => {
  let css = parse('a{one:1;two:2}')
  expect(css.first.first.next()).toBe(css.first.last)
  expect(css.first.last.next()).not.toBeDefined()
})

it('next() returns undefined on no parent', () => {
  let css = parse('')
  expect(css.next()).not.toBeDefined()
})

it('prev() returns previous node', () => {
  let css = parse('a{one:1;two:2}')
  expect(css.first.last.prev()).toBe(css.first.first)
  expect(css.first.first.prev()).not.toBeDefined()
})

it('prev() returns undefined on no parent', () => {
  let css = parse('')
  expect(css.prev()).not.toBeDefined()
})

it('toJSON() cleans parents inside', () => {
  let rule = new Rule({ selector: 'a' })
  rule.append({ prop: 'color', value: 'b' })

  let json = rule.toJSON()
  expect(json.parent).not.toBeDefined()
  expect(json.nodes[0].parent).not.toBeDefined()

  expect(JSON.stringify(rule))
    .toEqual('{"raws":{},"selector":"a","type":"rule","nodes":[' +
             '{"raws":{},"prop":"color","value":"b","type":"decl"}' +
             ']}')
})

it('toJSON() converts custom properties', () => {
  let root = new Root()
  root._cache = [1]
  root._hack = {
    toJSON () {
      return 'hack'
    }
  }

  expect(root.toJSON()).toEqual({
    type: 'root',
    nodes: [],
    raws: { },
    _hack: 'hack',
    _cache: [1]
  })
})

it('raw() has shortcut to stringifier', () => {
  let rule = new Rule({ selector: 'a' })
  expect(rule.raw('before')).toEqual('')
})

it('root() returns root', () => {
  let css = parse('@page{a{color:black}}')
  expect(css.first.first.first.root()).toBe(css)
})

it('root() returns parent of parents', () => {
  let rule = new Rule({ selector: 'a' })
  rule.append({ prop: 'color', value: 'black' })
  expect(rule.first.root()).toBe(rule)
})

it('root() returns self on root', () => {
  let rule = new Rule({ selector: 'a' })
  expect(rule.root()).toBe(rule)
})

it('cleanRaws() cleans style recursivelly', () => {
  let css = parse('@page{a{color:black}}')
  css.cleanRaws()

  expect(css.toString())
    .toEqual('@page {\n    a {\n        color: black\n    }\n}')
  expect(css.first.raws.before).not.toBeDefined()
  expect(css.first.first.first.raws.before).not.toBeDefined()
  expect(css.first.raws.between).not.toBeDefined()
  expect(css.first.first.first.raws.between).not.toBeDefined()
  expect(css.first.raws.after).not.toBeDefined()
})

it('cleanRaws() keeps between on request', () => {
  let css = parse('@page{a{color:black}}')
  css.cleanRaws(true)

  expect(css.toString())
    .toEqual('@page{\n    a{\n        color:black\n    }\n}')
  expect(css.first.raws.between).toBeDefined()
  expect(css.first.first.first.raws.between).toBeDefined()
  expect(css.first.raws.before).not.toBeDefined()
  expect(css.first.first.first.raws.before).not.toBeDefined()
  expect(css.first.raws.after).not.toBeDefined()
})

it('positionInside() returns position when node starts mid-line', () => {
  let css = parse('a {  one: X  }')
  let one = css.first.first
  expect(one.positionInside(6)).toEqual({ line: 1, column: 12 })
})

it('positionInside() returns position when before contains newline', () => {
  let css = parse('a {\n  one: X}')
  let one = css.first.first
  expect(one.positionInside(6)).toEqual({ line: 2, column: 9 })
})

it('positionInside() returns position when node contains newlines', () => {
  let css = parse('a {\n\tone: 1\n\t\tX\n3}')
  let one = css.first.first
  expect(one.positionInside(10)).toEqual({ line: 3, column: 4 })
})
