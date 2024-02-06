import { test } from 'uvu'
import { equal, is, match, throws, type } from 'uvu/assert'

import { AtRule, Declaration, parse, Root, Rule } from '../lib/postcss.js'

let example =
  'a { a: 1; b: 2 }' +
  '/* a */' +
  '@keyframes anim {' +
  '/* b */' +
  'to { c: 3 }' +
  '}' +
  '@media all and (min-width: 100) {' +
  'em { d: 4 }' +
  '@page {' +
  'e: 5;' +
  '/* c */' +
  '}' +
  '}'

test('throws error on declaration without value', () => {
  throws(() => {
    // @ts-expect-error
    new Rule().append({ prop: 'color', vlaue: 'black' })
  }, /Value field is missed/)
})

test('throws error on unknown node type', () => {
  throws(() => {
    // @ts-expect-error
    new Rule().append({ foo: 'bar' })
  }, /Unknown node type/)
})

test('push() adds child without checks', () => {
  let rule = parse('a { a: 1; b: 2 }').first as Rule
  rule.push(new Declaration({ prop: 'c', value: '3' }))
  is(rule.toString(), 'a { a: 1; b: 2; c: 3 }')
  is(rule.nodes.length, 3)
  type(rule.last?.raws.before, 'undefined')
})

test('each() iterates', () => {
  let rule = parse('a { a: 1; b: 2 }').first as Rule
  let indexes: number[] = []

  let result = rule.each((decl, i) => {
    indexes.push(i)
    is(decl, rule.nodes[i])
  })

  type(result, 'undefined')
  equal(indexes, [0, 1])
})

test('each() iterates with prepend', () => {
  let rule = parse('a { a: 1; b: 2 }').first as Rule
  let size = 0

  rule.each(() => {
    rule.prepend({ prop: 'color', value: 'aqua' })
    size += 1
  })

  is(size, 2)
})

test('each() iterates with prepend insertBefore', () => {
  let rule = parse('a { a: 1; b: 2 }').first as Rule
  let size = 0

  rule.each(decl => {
    if (decl.type === 'decl' && decl.prop === 'a') {
      rule.insertBefore(decl, { prop: 'c', value: '3' })
    }
    size += 1
  })

  is(size, 2)
})

test('each() iterates with append insertBefore', () => {
  let rule = parse('a { a: 1; b: 2 }').first as Rule
  let size = 0

  rule.each((decl, i) => {
    if (decl.type === 'decl' && decl.prop === 'a') {
      rule.insertBefore(i + 1, { prop: 'c', value: '3' })
    }
    size += 1
  })

  is(size, 3)
})

test('each() iterates with prepend insertAfter', () => {
  let rule = parse('a { a: 1; b: 2 }').first as Rule
  let size = 0

  rule.each((decl, i) => {
    rule.insertAfter(i - 1, { prop: 'c', value: '3' })
    size += 1
  })

  is(size, 2)
})

test('each() iterates with append insertAfter', () => {
  let rule = parse('a { a: 1; b: 2 }').first as Rule
  let size = 0

  rule.each((decl, i) => {
    if (decl.type === 'decl' && decl.prop === 'a') {
      rule.insertAfter(i, { prop: 'c', value: '3' })
    }
    size += 1
  })

  is(size, 3)
})

test('each() iterates with remove', () => {
  let rule = parse('a { a: 1; b: 2 }').first as Rule
  let size = 0

  rule.each(() => {
    rule.removeChild(0)
    size += 1
  })

  is(size, 2)
})

test('each() breaks iteration', () => {
  let rule = parse('a { a: 1; b: 2 }').first as Rule
  let indexes: number[] = []

  let result = rule.each((decl, i) => {
    indexes.push(i)
    return false
  })

  is(result, false)
  equal(indexes, [0])
})

test('each() allows to change children', () => {
  let rule = parse('a { a: 1; b: 2 }').first as Rule
  let props: string[] = []

  rule.each(decl => {
    if (decl.type === 'decl') {
      props.push(decl.prop)
      rule.nodes = [rule.last as any, rule.first as any]
    }
  })

  equal(props, ['a', 'a'])
})

test('walk() iterates', () => {
  let types: string[] = []
  let indexes: number[] = []

  let result = parse(example).walk((node, i) => {
    types.push(node.type)
    indexes.push(i)
  })

  type(result, 'undefined')
  equal(types, [
    'rule',
    'decl',
    'decl',
    'comment',
    'atrule',
    'comment',
    'rule',
    'decl',
    'atrule',
    'rule',
    'decl',
    'atrule',
    'decl',
    'comment'
  ])
  equal(indexes, [0, 0, 1, 1, 2, 0, 1, 0, 3, 0, 0, 1, 0, 1])
})

test('walk() breaks iteration', () => {
  let indexes: number[] = []

  let result = parse(example).walk((decl, i) => {
    indexes.push(i)
    return false
  })

  is(result, false)
  equal(indexes, [0])
})

test('walk() adds CSS position to error stack', () => {
  let error = new Error('T')
  error.stack = 'Error: T\n    at b (b.js:2:4)\n    at a (a.js:2:1)'
  let root = parse(example, { from: '/c.css' })
  let catched: any
  try {
    root.walk(() => {
      throw error
    })
  } catch (e) {
    catched = e
  }
  is(catched, error)
  is(catched.postcssNode.toString(), 'a { a: 1; b: 2 }')
  is(
    catched.stack.replace(/.:\\/i, '/'),
    'Error: T\n    at /c.css:1:1\n    at b (b.js:2:4)\n    at a (a.js:2:1)'
  )
})

test('walkDecls() iterates', () => {
  let props: string[] = []
  let indexes: number[] = []

  let result = parse(example).walkDecls((decl, i) => {
    props.push(decl.prop)
    indexes.push(i)
  })

  type(result, 'undefined')
  equal(props, ['a', 'b', 'c', 'd', 'e'])
  equal(indexes, [0, 1, 0, 0, 0])
})

test('walkDecls() iterates with changes', () => {
  let size = 0
  parse(example).walkDecls((decl, i) => {
    decl.parent?.removeChild(i)
    size += 1
  })
  is(size, 5)
})

test('walkDecls() breaks iteration', () => {
  let indexes: number[] = []

  let result = parse(example).walkDecls((decl, i) => {
    indexes.push(i)
    return false
  })

  is(result, false)
  equal(indexes, [0])
})

test('walkDecls() filters declarations by property name', () => {
  let css = parse('@page{a{one:1}}b{one:1;two:2}')
  let size = 0

  css.walkDecls('one', decl => {
    is(decl.prop, 'one')
    size += 1
  })

  is(size, 2)
})

test('walkDecls() breaks declarations filter by name', () => {
  let css = parse('@page{a{one:1}}b{one:1;two:2}')
  let size = 0

  css.walkDecls('one', () => {
    size += 1
    return false
  })

  is(size, 1)
})

test('walkDecls() filters declarations by property regexp', () => {
  let css = parse('@page{a{one:1}}b{one-x:1;two:2}')
  let size = 0

  css.walkDecls(/one(-x)?/, () => {
    size += 1
  })

  is(size, 2)
})

test('walkDecls() breaks declarations filters by regexp', () => {
  let css = parse('@page{a{one:1}}b{one-x:1;two:2}')
  let size = 0

  css.walkDecls(/one(-x)?/, () => {
    size += 1
    return false
  })

  is(size, 1)
})

test('walkComments() iterates', () => {
  let texts: string[] = []
  let indexes: number[] = []

  let result = parse(example).walkComments((comment, i) => {
    texts.push(comment.text)
    indexes.push(i)
  })

  type(result, 'undefined')
  equal(texts, ['a', 'b', 'c'])
  equal(indexes, [1, 0, 1])
})

test('walkComments() iterates with changes', () => {
  let size = 0
  parse(example).walkComments((comment, i) => {
    comment.parent?.removeChild(i)
    size += 1
  })
  is(size, 3)
})

test('walkComments() breaks iteration', () => {
  let indexes: number[] = []

  let result = parse(example).walkComments((comment, i) => {
    indexes.push(i)
    return false
  })

  is(result, false)
  equal(indexes, [1])
})

test('walkRules() iterates', () => {
  let selectors: string[] = []
  let indexes: number[] = []

  let result = parse(example).walkRules((rule, i) => {
    selectors.push(rule.selector)
    indexes.push(i)
  })

  type(result, 'undefined')
  equal(selectors, ['a', 'to', 'em'])
  equal(indexes, [0, 1, 0])
})

test('walkRules() iterates with changes', () => {
  let size = 0
  parse(example).walkRules((rule, i) => {
    rule.parent?.removeChild(i)
    size += 1
  })
  is(size, 3)
})

test('walkRules() breaks iteration', () => {
  let indexes: number[] = []

  let result = parse(example).walkRules((rule, i) => {
    indexes.push(i)
    return false
  })

  is(result, false)
  equal(indexes, [0])
})

test('walkRules() filters by selector', () => {
  let size = 0
  parse('a{}b{}a{}').walkRules('a', rule => {
    is(rule.selector, 'a')
    size += 1
  })
  is(size, 2)
})

test('walkRules() breaks selector filters', () => {
  let size = 0
  parse('a{}b{}a{}').walkRules('a', () => {
    size += 1
    return false
  })
  is(size, 1)
})

test('walkRules() filters by regexp', () => {
  let size = 0
  parse('a{}a b{}b a{}').walkRules(/^a/, rule => {
    match(rule.selector, /^a/)
    size += 1
  })
  is(size, 2)
})

test('walkRules() breaks selector regexp', () => {
  let size = 0
  parse('a{}b a{}b a{}').walkRules(/^a/, () => {
    size += 1
    return false
  })
  is(size, 1)
})

test('walkAtRules() iterates', () => {
  let names: string[] = []
  let indexes: number[] = []

  let result = parse(example).walkAtRules((atrule, i) => {
    names.push(atrule.name)
    indexes.push(i)
  })

  type(result, 'undefined')
  equal(names, ['keyframes', 'media', 'page'])
  equal(indexes, [2, 3, 1])
})

test('walkAtRules() iterates with changes', () => {
  let size = 0
  parse(example).walkAtRules((atrule, i) => {
    atrule.parent?.removeChild(i)
    size += 1
  })
  is(size, 3)
})

test('walkAtRules() breaks iteration', () => {
  let indexes: number[] = []

  let result = parse(example).walkAtRules((atrule, i) => {
    indexes.push(i)
    return false
  })

  is(result, false)
  equal(indexes, [2])
})

test('walkAtRules() filters at-rules by name', () => {
  let css = parse('@page{@page 2{}}@media print{@page{}}')
  let size = 0

  css.walkAtRules('page', atrule => {
    is(atrule.name, 'page')
    size += 1
  })

  is(size, 3)
})

test('walkAtRules() breaks name filter', () => {
  let size = 0
  parse('@page{@page{@page{}}}').walkAtRules('page', () => {
    size += 1
    return false
  })
  is(size, 1)
})

test('walkAtRules() filters at-rules by name regexp', () => {
  let css = parse('@page{@page 2{}}@media print{@pages{}}')
  let size = 0

  css.walkAtRules(/page/, () => {
    size += 1
  })

  is(size, 3)
})

test('walkAtRules() breaks regexp filter', () => {
  let size = 0
  parse('@page{@pages{@page{}}}').walkAtRules(/page/, () => {
    size += 1
    return false
  })
  is(size, 1)
})

test('append() appends child', () => {
  let rule = parse('a { a: 1; b: 2 }').first as Rule
  rule.append({ prop: 'c', value: '3' })
  is(rule.toString(), 'a { a: 1; b: 2; c: 3 }')
  is(rule.last?.raws.before, ' ')
})

test('append() appends multiple children', () => {
  let rule = parse('a { a: 1; b: 2 }').first as Rule
  rule.append({ prop: 'c', value: '3' }, { prop: 'd', value: '4' })
  is(rule.toString(), 'a { a: 1; b: 2; c: 3; d: 4 }')
  is(rule.last?.raws.before, ' ')
})

test('append() has declaration shortcut', () => {
  let rule = parse('a { a: 1; b: 2 }').first as Rule
  rule.append({ prop: 'c', value: '3' })
  is(rule.toString(), 'a { a: 1; b: 2; c: 3 }')
})

test('append() has rule shortcut', () => {
  let root = new Root()
  root.append({ selector: 'a' })
  is(root.first?.toString(), 'a {}')
})

test('append() has at-rule shortcut', () => {
  let root = new Root()
  root.append({ name: 'encoding', params: '"utf-8"' })
  is(root.first?.toString(), '@encoding "utf-8"')
})

test('append() has comment shortcut', () => {
  let root = new Root()
  root.append({ text: 'ok' })
  is(root.first?.toString(), '/* ok */')
})

test('append() receives root', () => {
  let css = parse('a {}')
  css.append(parse('b {}'))
  is(css.toString(), 'a {}b {}')
})

test('append() reveives string', () => {
  let root = new Root()
  root.append('a{}b{}')
  let a = root.first as Rule
  a.append('color:black')
  is(root.toString(), 'a{color:black}b{}')
  type(a.first?.source, 'undefined')
})

test('append() receives array', () => {
  let a = parse('a{ z-index: 1 }')
  let b = parse('b{ width: 1px; height: 2px }')
  let aRule = a.first as Rule
  let bRule = b.first as Rule

  aRule.append(bRule.nodes)
  is(a.toString(), 'a{ z-index: 1; width: 1px; height: 2px }')
  is(b.toString(), 'b{ }')
})

test('append() move node on insert', () => {
  let a = parse('a{}')
  let b = parse('b{}')

  b.append(a.first as Rule)
  let bLast = b.last as Rule
  bLast.selector = 'b a'

  is(a.toString(), '')
  is(b.toString(), 'b{}b a{}')
})

test('prepend() prepends child', () => {
  let rule = parse('a { a: 1; b: 2 }').first as Rule
  rule.prepend({ prop: 'c', value: '3' })
  is(rule.toString(), 'a { c: 3; a: 1; b: 2 }')
  is(rule.first?.raws.before, ' ')
})

test('prepend() prepends multiple children', () => {
  let rule = parse('a { a: 1; b: 2 }').first as Rule
  rule.prepend({ prop: 'c', value: '3' }, { prop: 'd', value: '4' })
  is(rule.toString(), 'a { c: 3; d: 4; a: 1; b: 2 }')
  is(rule.first?.raws.before, ' ')
})

test('prepend() receive hash instead of declaration', () => {
  let rule = parse('a { a: 1; b: 2 }').first as Rule
  rule.prepend({ prop: 'c', value: '3' })
  is(rule.toString(), 'a { c: 3; a: 1; b: 2 }')
})

test('prepend() receives root', () => {
  let css = parse('a {}')
  css.prepend(parse('b {}'))
  is(css.toString(), 'b {}\na {}')
})

test('prepend() receives string', () => {
  let css = parse('a {}')
  css.prepend('b {}')
  is(css.toString(), 'b {}\na {}')
})

test('prepend() receives array', () => {
  let a = parse('a{ z-index: 1 }')
  let b = parse('b{ width: 1px; height: 2px }')
  let aRule = a.first as Rule
  let bRule = b.first as Rule

  aRule.prepend(bRule.nodes)
  is(a.toString(), 'a{ width: 1px; height: 2px; z-index: 1 }')
})

test('prepend() works on empty container', () => {
  let root = parse('')
  root.prepend(new Rule({ selector: 'a' }))
  is(root.toString(), 'a {}')
})

test('insertBefore() inserts child', () => {
  let rule = parse('a { a: 1; b: 2 }').first as Rule
  rule.insertBefore(1, { prop: 'c', value: '3' })
  is(rule.toString(), 'a { a: 1; c: 3; b: 2 }')
  is(rule.nodes[1].raws.before, ' ')
})

test('insertBefore() works with nodes too', () => {
  let rule = parse('a { a: 1; b: 2 }').first as Rule
  rule.insertBefore(rule.nodes[1], { prop: 'c', value: '3' })
  is(rule.toString(), 'a { a: 1; c: 3; b: 2 }')
})

test('insertBefore() receive hash instead of declaration', () => {
  let rule = parse('a { a: 1; b: 2 }').first as Rule
  rule.insertBefore(1, { prop: 'c', value: '3' })
  is(rule.toString(), 'a { a: 1; c: 3; b: 2 }')
})

test('insertBefore() receives array', () => {
  let a = parse('a{ color: red; z-index: 1 }')
  let b = parse('b{ width: 1; height: 2 }')
  let aRule = a.first as Rule
  let bRule = b.first as Rule

  aRule.insertBefore(1, bRule.nodes)
  is(a.toString(), 'a{ color: red; width: 1; height: 2; z-index: 1 }')
})

test('insertBefore() receives pre-existing child node - a', () => {
  let a = parse('a{ align-items: start; color: red; z-index: 1 }')
  let declA = (a.first as Rule).nodes[0]
  let declC = (a.first as Rule).nodes[2]
  declC.before(declA)

  is(a.toString(), 'a{ color: red; align-items: start; z-index: 1 }')
})

test('insertBefore() receives pre-existing child node - b', () => {
  let a = parse('a{ align-items: start; color: red; z-index: 1 }')
  let declA = (a.first as Rule).nodes[0]
  let declC = (a.first as Rule).nodes[2]
  declA.before(declC)

  is(a.toString(), 'a{ z-index: 1; align-items: start; color: red }')
})

test('insertBefore() has defined way of adding newlines', () => {
  let root = parse('a {}')
  root.insertBefore(root.first as Rule, 'b {}')
  root.insertBefore(root.first as Rule, 'c {}')
  is(root.toString(), 'c {}\nb {}\na {}')

  root = parse('other {}a {}')
  root.insertBefore(root.first as Rule, 'b {}')
  root.insertBefore(root.first as Rule, 'c {}')
  is(root.toString(), 'c {}b {}other {}a {}')

  root = parse('other {}\na {}')
  root.insertBefore(root.nodes[1] as Rule, 'b {}')
  root.insertBefore(root.nodes[1] as Rule, 'c {}')
  is(root.toString(), 'other {}\nc {}\nb {}\na {}')

  root = parse('other {}a {}')
  root.insertBefore(root.nodes[1] as Rule, 'b {}')
  root.insertBefore(root.nodes[1] as Rule, 'c {}')
  is(root.toString(), 'other {}c {}b {}a {}')
})

test('insertAfter() inserts child', () => {
  let rule = parse('a { a: 1; b: 2 }').first as Rule
  rule.insertAfter(0, { prop: 'c', value: '3' })
  is(rule.toString(), 'a { a: 1; c: 3; b: 2 }')
  is(rule.nodes[1].raws.before, ' ')
})

test('insertAfter() works with nodes too', () => {
  let rule = parse('a { a: 1; b: 2 }').first as Rule
  let aDecl = rule.first as Declaration
  rule.insertAfter(aDecl, { prop: 'c', value: '3' })
  is(rule.toString(), 'a { a: 1; c: 3; b: 2 }')
})

test('insertAfter() receive hash instead of declaration', () => {
  let rule = parse('a { a: 1; b: 2 }').first as Rule
  rule.insertAfter(0, { prop: 'c', value: '3' })
  is(rule.toString(), 'a { a: 1; c: 3; b: 2 }')
})

test('insertAfter() receives array', () => {
  let a = parse('a{ color: red; z-index: 1 }')
  let b = parse('b{ width: 1; height: 2 }')
  let aRule = a.first as Rule
  let bRule = b.first as Rule

  aRule.insertAfter(0, bRule.nodes)
  is(a.toString(), 'a{ color: red; width: 1; height: 2; z-index: 1 }')
})

test('insertAfter() receives pre-existing child node - a', () => {
  let a = parse('a{ align-items: start; color: red; z-index: 1 }')
  let declA = (a.first as Rule).nodes[0]
  let declC = (a.first as Rule).nodes[2]
  declC.after(declA)

  is(a.toString(), 'a{ color: red; z-index: 1; align-items: start }')
})

test('insertAfter() receives pre-existing child node - b', () => {
  let a = parse('a{ align-items: start; color: red; z-index: 1 }')
  let declA = (a.first as Rule).nodes[0]
  let declC = (a.first as Rule).nodes[2]
  declA.after(declC)

  is(a.toString(), 'a{ align-items: start; z-index: 1; color: red }')
})

test('removeChild() removes by index', () => {
  let rule = parse('a { a: 1; b: 2 }').first as Rule
  rule.removeChild(1)
  is(rule.toString(), 'a { a: 1 }')
})

test('removeChild() removes by node', () => {
  let rule = parse('a { a: 1; b: 2 }').first as Rule
  let bDecl = rule.last as Declaration
  rule.removeChild(bDecl)
  is(rule.toString(), 'a { a: 1 }')
})

test('removeChild() cleans parent in removed node', () => {
  let rule = parse('a { a: 1; b: 2 }').first as Rule
  let aDecl = rule.first as Declaration
  rule.removeChild(aDecl)
  type(aDecl.parent, 'undefined')
})

test('removeAll() removes all children', () => {
  let rule = parse('a { a: 1; b: 2 }').first as Rule
  let decl = rule.first as Declaration
  rule.removeAll()

  type(decl.parent, 'undefined')
  is(rule.toString(), 'a { }')
})

test('replaceValues() replaces strings', () => {
  let css = parse('a{one:1}b{two:1 2}')
  let result = css.replaceValues('1', 'A')

  equal(result, css)
  is(css.toString(), 'a{one:A}b{two:A 2}')
})

test('replaceValues() replaces regpexp', () => {
  let css = parse('a{one:1}b{two:1 2}')
  css.replaceValues(/\d/g, i => i + 'A')
  is(css.toString(), 'a{one:1A}b{two:1A 2A}')
})

test('replaceValues() filters properties', () => {
  let css = parse('a{one:1}b{two:1 2}')
  css.replaceValues('1', { props: ['one'] }, 'A')
  is(css.toString(), 'a{one:A}b{two:1 2}')
})

test('replaceValues() uses fast check', () => {
  let css = parse('a{one:1}b{two:1 2}')
  css.replaceValues('1', { fast: '2' }, 'A')
  is(css.toString(), 'a{one:1}b{two:A 2}')
})

test('any() return true if all children return true', () => {
  let rule = parse('a { a: 1; b: 2 }').first as Rule
  is(
    rule.every(i => i.type === 'decl' && /a|b/.test(i.prop)),
    true
  )
  is(
    rule.every(i => i.type === 'decl' && /b/.test(i.prop)),
    false
  )
})

test('some() return true if all children return true', () => {
  let rule = parse('a { a: 1; b: 2 }').first as Rule
  is(
    rule.some(i => i.type === 'decl' && i.prop === 'b'),
    true
  )
  is(
    rule.some(i => i.type === 'decl' && i.prop === 'c'),
    false
  )
})

test('index() returns child index', () => {
  let rule = parse('a { a: 1; b: 2 }').first as Rule
  is(rule.index(rule.nodes[1]), 1)
})

test('index() returns argument if it is number', () => {
  let rule = parse('a { a: 1; b: 2 }').first as Rule
  is(rule.index(2), 2)
})

test('first() works for children-less nodes', () => {
  let atRule = parse('@charset "UTF-*"').first as AtRule
  type(atRule.first, 'undefined')
})

test('last() works for children-less nodes', () => {
  let atRule = parse('@charset "UTF-*"').first as AtRule
  type(atRule.last, 'undefined')
})

test('returns first child', () => {
  let rule = parse('a { a: 1; b: 2 }').first as Rule
  let aDecl = rule.first as Declaration
  is(aDecl.prop, 'a')
})

test('returns last child', () => {
  let rule = parse('a { a: 1; b: 2 }').first as Rule
  let bDecl = rule.last as Declaration
  is(bDecl.prop, 'b')
})

test('normalize() does not normalize new children with exists before', () => {
  let rule = parse('a { a: 1; b: 2 }').first as Rule
  rule.append({ prop: 'c', raws: { before: '\n ' }, value: '3' })
  is(rule.toString(), 'a { a: 1; b: 2;\n c: 3 }')
})

test('forces Declaration#value to be string', () => {
  let rule = parse('a { a: 1; b: 2 }').first as Rule
  // @ts-expect-error
  rule.append({ prop: 'c', value: 3 })
  let aDecl = rule.first as Declaration
  let cDecl = rule.last as Declaration
  type(aDecl.value, 'string')
  type(cDecl.value, 'string')
})

test('updates parent in overrides.nodes in constructor', () => {
  let root = new Root({ nodes: [{ selector: 'a' }] })
  let a = root.first as Rule
  equal(a.parent, root)

  root.append({
    nodes: [{ prop: 'color', value: 'black' }],
    selector: 'b'
  })
  let b = root.last as Rule
  let color = b.first as Declaration
  equal(color.parent, root.last)
})

test('allows to clone nodes', () => {
  let root1 = parse('a { color: black; z-index: 1 } b {}')
  let root2 = new Root({ nodes: root1.nodes })
  is(root1.toString(), 'a { color: black; z-index: 1 } b {}')
  is(root2.toString(), 'a { color: black; z-index: 1 } b {}')
})

test('container.nodes can be sorted', () => {
  let root = parse('@b; @c; @a;')
  let b = root.nodes[0]

  root.nodes.sort((x, y) => {
    return (x as AtRule).name.localeCompare((y as AtRule).name)
  })

  // Sorted nodes are reflected in "toString".
  is(root.toString(), ' @a;@b; @c;')

  // Sorted nodes are reflected in "walk".
  let result: string[] = []
  root.walkAtRules(atRule => {
    result.push(atRule.name.trim())
  })

  is(result.join(' '), 'a b c')

  // Sorted nodes have the corect "index".
  is(root.index(b), 1)

  // Inserting after a sorted node results in the correct order.
  b.after('@d;')
  is(root.toString(), ' @a;@b;@d; @c;')
})

test('ignores undefined on adding', () => {
  let rule = parse('a { a: 1; b: 2 }').first as Rule
  rule.append({ prop: 'c', value: '3' }, undefined)
  rule.prepend(undefined)
  rule.insertAfter(0, undefined)
  rule.insertBefore(0, undefined)
  rule.after(undefined)
  rule.before(undefined)
  is(rule.parent!.toString(), 'a { a: 1; b: 2; c: 3 }')
})

test.run()
