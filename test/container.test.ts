import { Declaration, Root, Rule, AtRule, parse } from '../lib/postcss.js'

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

it('throws error on declaration without value', () => {
  expect(() => {
    // @ts-expect-error
    new Rule().append({ prop: 'color', vlaue: 'black' })
  }).toThrow(/Value field is missed/)
})

it('throws error on unknown node type', () => {
  expect(() => {
    // @ts-expect-error
    new Rule().append({ foo: 'bar' })
  }).toThrow(/Unknown node type/)
})

it('push() adds child without checks', () => {
  let rule = parse('a { a: 1; b: 2 }').first as Rule
  rule.push(new Declaration({ prop: 'c', value: '3' }))
  expect(rule.toString()).toEqual('a { a: 1; b: 2; c: 3 }')
  expect(rule.nodes).toHaveLength(3)
  expect(rule.last?.raws.before).not.toBeDefined()
})

it('each() iterates', () => {
  let rule = parse('a { a: 1; b: 2 }').first as Rule
  let indexes: number[] = []

  let result = rule.each((decl, i) => {
    indexes.push(i)
    expect(decl).toBe(rule.nodes[i])
  })

  expect(result).not.toBeDefined()
  expect(indexes).toEqual([0, 1])
})

it('each() iterates with prepend', () => {
  let rule = parse('a { a: 1; b: 2 }').first as Rule
  let size = 0

  rule.each(() => {
    rule.prepend({ prop: 'color', value: 'aqua' })
    size += 1
  })

  expect(size).toEqual(2)
})

it('each() iterates with prepend insertBefore', () => {
  let rule = parse('a { a: 1; b: 2 }').first as Rule
  let size = 0

  rule.each(decl => {
    if (decl.type === 'decl' && decl.prop === 'a') {
      rule.insertBefore(decl, { prop: 'c', value: '3' })
    }
    size += 1
  })

  expect(size).toEqual(2)
})

it('each() iterates with append insertBefore', () => {
  let rule = parse('a { a: 1; b: 2 }').first as Rule
  let size = 0

  rule.each((decl, i) => {
    if (decl.type === 'decl' && decl.prop === 'a') {
      rule.insertBefore(i + 1, { prop: 'c', value: '3' })
    }
    size += 1
  })

  expect(size).toEqual(3)
})

it('each() iterates with prepend insertAfter', () => {
  let rule = parse('a { a: 1; b: 2 }').first as Rule
  let size = 0

  rule.each((decl, i) => {
    rule.insertAfter(i - 1, { prop: 'c', value: '3' })
    size += 1
  })

  expect(size).toEqual(2)
})

it('each() iterates with append insertAfter', () => {
  let rule = parse('a { a: 1; b: 2 }').first as Rule
  let size = 0

  rule.each((decl, i) => {
    if (decl.type === 'decl' && decl.prop === 'a') {
      rule.insertAfter(i, { prop: 'c', value: '3' })
    }
    size += 1
  })

  expect(size).toEqual(3)
})

it('each() iterates with remove', () => {
  let rule = parse('a { a: 1; b: 2 }').first as Rule
  let size = 0

  rule.each(() => {
    rule.removeChild(0)
    size += 1
  })

  expect(size).toEqual(2)
})

it('each() breaks iteration', () => {
  let rule = parse('a { a: 1; b: 2 }').first as Rule
  let indexes: number[] = []

  let result = rule.each((decl, i) => {
    indexes.push(i)
    return false
  })

  expect(result).toBe(false)
  expect(indexes).toEqual([0])
})

it('each() allows to change children', () => {
  let rule = parse('a { a: 1; b: 2 }').first as Rule
  let props: string[] = []

  rule.each(decl => {
    if (decl.type === 'decl') {
      props.push(decl.prop)
      rule.nodes = [rule.last as any, rule.first as any]
    }
  })

  expect(props).toEqual(['a', 'a'])
})

it('walk() iterates', () => {
  let types: string[] = []
  let indexes: number[] = []

  let result = parse(example).walk((node, i) => {
    types.push(node.type)
    indexes.push(i)
  })

  expect(result).not.toBeDefined()
  expect(types).toEqual([
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
  expect(indexes).toEqual([0, 0, 1, 1, 2, 0, 1, 0, 3, 0, 0, 1, 0, 1])
})

it('walk() breaks iteration', () => {
  let indexes: number[] = []

  let result = parse(example).walk((decl, i) => {
    indexes.push(i)
    return false
  })

  expect(result).toBe(false)
  expect(indexes).toEqual([0])
})

it('walk() adds CSS position to error stack', () => {
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
  expect(catched).toBe(error)
  expect(catched.postcssNode.toString()).toEqual('a { a: 1; b: 2 }')
  expect(catched.stack.replace(/.:\\/i, '/')).toEqual(
    'Error: T\n    at /c.css:1:1\n    at b (b.js:2:4)\n    at a (a.js:2:1)'
  )
})

it('walkDecls() iterates', () => {
  let props: string[] = []
  let indexes: number[] = []

  let result = parse(example).walkDecls((decl, i) => {
    props.push(decl.prop)
    indexes.push(i)
  })

  expect(result).not.toBeDefined()
  expect(props).toEqual(['a', 'b', 'c', 'd', 'e'])
  expect(indexes).toEqual([0, 1, 0, 0, 0])
})

it('walkDecls() iterates with changes', () => {
  let size = 0
  parse(example).walkDecls((decl, i) => {
    decl.parent?.removeChild(i)
    size += 1
  })
  expect(size).toEqual(5)
})

it('walkDecls() breaks iteration', () => {
  let indexes: number[] = []

  let result = parse(example).walkDecls((decl, i) => {
    indexes.push(i)
    return false
  })

  expect(result).toBe(false)
  expect(indexes).toEqual([0])
})

it('walkDecls() filters declarations by property name', () => {
  let css = parse('@page{a{one:1}}b{one:1;two:2}')
  let size = 0

  css.walkDecls('one', decl => {
    expect(decl.prop).toEqual('one')
    size += 1
  })

  expect(size).toEqual(2)
})

it('walkDecls() breaks declarations filter by name', () => {
  let css = parse('@page{a{one:1}}b{one:1;two:2}')
  let size = 0

  css.walkDecls('one', () => {
    size += 1
    return false
  })

  expect(size).toEqual(1)
})

it('walkDecls() filters declarations by property regexp', () => {
  let css = parse('@page{a{one:1}}b{one-x:1;two:2}')
  let size = 0

  css.walkDecls(/one(-x)?/, () => {
    size += 1
  })

  expect(size).toEqual(2)
})

it('walkDecls() breaks declarations filters by regexp', () => {
  let css = parse('@page{a{one:1}}b{one-x:1;two:2}')
  let size = 0

  css.walkDecls(/one(-x)?/, () => {
    size += 1
    return false
  })

  expect(size).toEqual(1)
})

it('walkComments() iterates', () => {
  let texts: string[] = []
  let indexes: number[] = []

  let result = parse(example).walkComments((comment, i) => {
    texts.push(comment.text)
    indexes.push(i)
  })

  expect(result).not.toBeDefined()
  expect(texts).toEqual(['a', 'b', 'c'])
  expect(indexes).toEqual([1, 0, 1])
})

it('walkComments() iterates with changes', () => {
  let size = 0
  parse(example).walkComments((comment, i) => {
    comment.parent?.removeChild(i)
    size += 1
  })
  expect(size).toEqual(3)
})

it('walkComments() breaks iteration', () => {
  let indexes: number[] = []

  let result = parse(example).walkComments((comment, i) => {
    indexes.push(i)
    return false
  })

  expect(result).toBe(false)
  expect(indexes).toEqual([1])
})

it('walkRules() iterates', () => {
  let selectors: string[] = []
  let indexes: number[] = []

  let result = parse(example).walkRules((rule, i) => {
    selectors.push(rule.selector)
    indexes.push(i)
  })

  expect(result).not.toBeDefined()
  expect(selectors).toEqual(['a', 'to', 'em'])
  expect(indexes).toEqual([0, 1, 0])
})

it('walkRules() iterates with changes', () => {
  let size = 0
  parse(example).walkRules((rule, i) => {
    rule.parent?.removeChild(i)
    size += 1
  })
  expect(size).toEqual(3)
})

it('walkRules() breaks iteration', () => {
  let indexes: number[] = []

  let result = parse(example).walkRules((rule, i) => {
    indexes.push(i)
    return false
  })

  expect(result).toBe(false)
  expect(indexes).toEqual([0])
})

it('walkRules() filters by selector', () => {
  let size = 0
  parse('a{}b{}a{}').walkRules('a', rule => {
    expect(rule.selector).toEqual('a')
    size += 1
  })
  expect(size).toEqual(2)
})

it('walkRules() breaks selector filters', () => {
  let size = 0
  parse('a{}b{}a{}').walkRules('a', () => {
    size += 1
    return false
  })
  expect(size).toEqual(1)
})

it('walkRules() filters by regexp', () => {
  let size = 0
  parse('a{}a b{}b a{}').walkRules(/^a/, rule => {
    expect(rule.selector).toMatch(/^a/)
    size += 1
  })
  expect(size).toEqual(2)
})

it('walkRules() breaks selector regexp', () => {
  let size = 0
  parse('a{}b a{}b a{}').walkRules(/^a/, () => {
    size += 1
    return false
  })
  expect(size).toEqual(1)
})

it('walkAtRules() iterates', () => {
  let names: string[] = []
  let indexes: number[] = []

  let result = parse(example).walkAtRules((atrule, i) => {
    names.push(atrule.name)
    indexes.push(i)
  })

  expect(result).not.toBeDefined()
  expect(names).toEqual(['keyframes', 'media', 'page'])
  expect(indexes).toEqual([2, 3, 1])
})

it('walkAtRules() iterates with changes', () => {
  let size = 0
  parse(example).walkAtRules((atrule, i) => {
    atrule.parent?.removeChild(i)
    size += 1
  })
  expect(size).toEqual(3)
})

it('walkAtRules() breaks iteration', () => {
  let indexes: number[] = []

  let result = parse(example).walkAtRules((atrule, i) => {
    indexes.push(i)
    return false
  })

  expect(result).toBe(false)
  expect(indexes).toEqual([2])
})

it('walkAtRules() filters at-rules by name', () => {
  let css = parse('@page{@page 2{}}@media print{@page{}}')
  let size = 0

  css.walkAtRules('page', atrule => {
    expect(atrule.name).toEqual('page')
    size += 1
  })

  expect(size).toEqual(3)
})

it('walkAtRules() breaks name filter', () => {
  let size = 0
  parse('@page{@page{@page{}}}').walkAtRules('page', () => {
    size += 1
    return false
  })
  expect(size).toEqual(1)
})

it('walkAtRules() filters at-rules by name regexp', () => {
  let css = parse('@page{@page 2{}}@media print{@pages{}}')
  let size = 0

  css.walkAtRules(/page/, () => {
    size += 1
  })

  expect(size).toEqual(3)
})

it('walkAtRules() breaks regexp filter', () => {
  let size = 0
  parse('@page{@pages{@page{}}}').walkAtRules(/page/, () => {
    size += 1
    return false
  })
  expect(size).toEqual(1)
})

it('append() appends child', () => {
  let rule = parse('a { a: 1; b: 2 }').first as Rule
  rule.append({ prop: 'c', value: '3' })
  expect(rule.toString()).toEqual('a { a: 1; b: 2; c: 3 }')
  expect(rule.last?.raws.before).toEqual(' ')
})

it('append() appends multiple children', () => {
  let rule = parse('a { a: 1; b: 2 }').first as Rule
  rule.append({ prop: 'c', value: '3' }, { prop: 'd', value: '4' })
  expect(rule.toString()).toEqual('a { a: 1; b: 2; c: 3; d: 4 }')
  expect(rule.last?.raws.before).toEqual(' ')
})

it('append() has declaration shortcut', () => {
  let rule = parse('a { a: 1; b: 2 }').first as Rule
  rule.append({ prop: 'c', value: '3' })
  expect(rule.toString()).toEqual('a { a: 1; b: 2; c: 3 }')
})

it('append() has rule shortcut', () => {
  let root = new Root()
  root.append({ selector: 'a' })
  expect(root.first?.toString()).toEqual('a {}')
})

it('append() has at-rule shortcut', () => {
  let root = new Root()
  root.append({ name: 'encoding', params: '"utf-8"' })
  expect(root.first?.toString()).toEqual('@encoding "utf-8"')
})

it('append() has comment shortcut', () => {
  let root = new Root()
  root.append({ text: 'ok' })
  expect(root.first?.toString()).toEqual('/* ok */')
})

it('append() receives root', () => {
  let css = parse('a {}')
  css.append(parse('b {}'))
  expect(css.toString()).toEqual('a {}b {}')
})

it('append() reveives string', () => {
  let root = new Root()
  root.append('a{}b{}')
  let a = root.first as Rule
  a.append('color:black')
  expect(root.toString()).toEqual('a{color:black}b{}')
  expect(a.first?.source).not.toBeDefined()
})

it('append() receives array', () => {
  let a = parse('a{ z-index: 1 }')
  let b = parse('b{ width: 1px; height: 2px }')
  let aRule = a.first as Rule
  let bRule = b.first as Rule

  aRule.append(bRule.nodes)
  expect(a.toString()).toEqual('a{ z-index: 1; width: 1px; height: 2px }')
  expect(b.toString()).toEqual('b{ }')
})

it('append() move node on insert', () => {
  let a = parse('a{}')
  let b = parse('b{}')

  b.append(a.first as Rule)
  let bLast = b.last as Rule
  bLast.selector = 'b a'

  expect(a.toString()).toEqual('')
  expect(b.toString()).toEqual('b{}b a{}')
})

it('prepend() prepends child', () => {
  let rule = parse('a { a: 1; b: 2 }').first as Rule
  rule.prepend({ prop: 'c', value: '3' })
  expect(rule.toString()).toEqual('a { c: 3; a: 1; b: 2 }')
  expect(rule.first?.raws.before).toEqual(' ')
})

it('prepend() prepends multiple children', () => {
  let rule = parse('a { a: 1; b: 2 }').first as Rule
  rule.prepend({ prop: 'c', value: '3' }, { prop: 'd', value: '4' })
  expect(rule.toString()).toEqual('a { c: 3; d: 4; a: 1; b: 2 }')
  expect(rule.first?.raws.before).toEqual(' ')
})

it('prepend() receive hash instead of declaration', () => {
  let rule = parse('a { a: 1; b: 2 }').first as Rule
  rule.prepend({ prop: 'c', value: '3' })
  expect(rule.toString()).toEqual('a { c: 3; a: 1; b: 2 }')
})

it('prepend() receives root', () => {
  let css = parse('a {}')
  css.prepend(parse('b {}'))
  expect(css.toString()).toEqual('b {}\na {}')
})

it('prepend() receives string', () => {
  let css = parse('a {}')
  css.prepend('b {}')
  expect(css.toString()).toEqual('b {}\na {}')
})

it('prepend() receives array', () => {
  let a = parse('a{ z-index: 1 }')
  let b = parse('b{ width: 1px; height: 2px }')
  let aRule = a.first as Rule
  let bRule = b.first as Rule

  aRule.prepend(bRule.nodes)
  expect(a.toString()).toEqual('a{ width: 1px; height: 2px; z-index: 1 }')
})

it('prepend() works on empty container', () => {
  let root = parse('')
  root.prepend(new Rule({ selector: 'a' }))
  expect(root.toString()).toEqual('a {}')
})

it('insertBefore() inserts child', () => {
  let rule = parse('a { a: 1; b: 2 }').first as Rule
  rule.insertBefore(1, { prop: 'c', value: '3' })
  expect(rule.toString()).toEqual('a { a: 1; c: 3; b: 2 }')
  expect(rule.nodes[1].raws.before).toEqual(' ')
})

it('insertBefore() works with nodes too', () => {
  let rule = parse('a { a: 1; b: 2 }').first as Rule
  rule.insertBefore(rule.nodes[1], { prop: 'c', value: '3' })
  expect(rule.toString()).toEqual('a { a: 1; c: 3; b: 2 }')
})

it('insertBefore() receive hash instead of declaration', () => {
  let rule = parse('a { a: 1; b: 2 }').first as Rule
  rule.insertBefore(1, { prop: 'c', value: '3' })
  expect(rule.toString()).toEqual('a { a: 1; c: 3; b: 2 }')
})

it('insertBefore() receives array', () => {
  let a = parse('a{ color: red; z-index: 1 }')
  let b = parse('b{ width: 1; height: 2 }')
  let aRule = a.first as Rule
  let bRule = b.first as Rule

  aRule.insertBefore(1, bRule.nodes)
  expect(a.toString()).toEqual(
    'a{ color: red; width: 1; height: 2; z-index: 1 }'
  )
})

it('insertAfter() inserts child', () => {
  let rule = parse('a { a: 1; b: 2 }').first as Rule
  rule.insertAfter(0, { prop: 'c', value: '3' })
  expect(rule.toString()).toEqual('a { a: 1; c: 3; b: 2 }')
  expect(rule.nodes[1].raws.before).toEqual(' ')
})

it('insertAfter() works with nodes too', () => {
  let rule = parse('a { a: 1; b: 2 }').first as Rule
  let aDecl = rule.first as Declaration
  rule.insertAfter(aDecl, { prop: 'c', value: '3' })
  expect(rule.toString()).toEqual('a { a: 1; c: 3; b: 2 }')
})

it('insertAfter() receive hash instead of declaration', () => {
  let rule = parse('a { a: 1; b: 2 }').first as Rule
  rule.insertAfter(0, { prop: 'c', value: '3' })
  expect(rule.toString()).toEqual('a { a: 1; c: 3; b: 2 }')
})

it('insertAfter() receives array', () => {
  let a = parse('a{ color: red; z-index: 1 }')
  let b = parse('b{ width: 1; height: 2 }')
  let aRule = a.first as Rule
  let bRule = b.first as Rule

  aRule.insertAfter(0, bRule.nodes)
  expect(a.toString()).toEqual(
    'a{ color: red; width: 1; height: 2; z-index: 1 }'
  )
})

it('removeChild() removes by index', () => {
  let rule = parse('a { a: 1; b: 2 }').first as Rule
  rule.removeChild(1)
  expect(rule.toString()).toEqual('a { a: 1 }')
})

it('removeChild() removes by node', () => {
  let rule = parse('a { a: 1; b: 2 }').first as Rule
  let bDecl = rule.last as Declaration
  rule.removeChild(bDecl)
  expect(rule.toString()).toEqual('a { a: 1 }')
})

it('removeChild() cleans parent in removed node', () => {
  let rule = parse('a { a: 1; b: 2 }').first as Rule
  let aDecl = rule.first as Declaration
  rule.removeChild(aDecl)
  expect(aDecl.parent).not.toBeDefined()
})

it('removeAll() removes all children', () => {
  let rule = parse('a { a: 1; b: 2 }').first as Rule
  let decl = rule.first as Declaration
  rule.removeAll()

  expect(decl.parent).not.toBeDefined()
  expect(rule.toString()).toEqual('a { }')
})

it('replaceValues() replaces strings', () => {
  let css = parse('a{one:1}b{two:1 2}')
  let result = css.replaceValues('1', 'A')

  expect(result).toEqual(css)
  expect(css.toString()).toEqual('a{one:A}b{two:A 2}')
})

it('replaceValues() replaces regpexp', () => {
  let css = parse('a{one:1}b{two:1 2}')
  css.replaceValues(/\d/g, i => i + 'A')
  expect(css.toString()).toEqual('a{one:1A}b{two:1A 2A}')
})

it('replaceValues() filters properties', () => {
  let css = parse('a{one:1}b{two:1 2}')
  css.replaceValues('1', { props: ['one'] }, 'A')
  expect(css.toString()).toEqual('a{one:A}b{two:1 2}')
})

it('replaceValues() uses fast check', () => {
  let css = parse('a{one:1}b{two:1 2}')
  css.replaceValues('1', { fast: '2' }, 'A')
  expect(css.toString()).toEqual('a{one:1}b{two:A 2}')
})

it('any() return true if all children return true', () => {
  let rule = parse('a { a: 1; b: 2 }').first as Rule
  expect(rule.every(i => i.type === 'decl' && /a|b/.test(i.prop))).toBe(true)
  expect(rule.every(i => i.type === 'decl' && /b/.test(i.prop))).toBe(false)
})

it('some() return true if all children return true', () => {
  let rule = parse('a { a: 1; b: 2 }').first as Rule
  expect(rule.some(i => i.type === 'decl' && i.prop === 'b')).toBe(true)
  expect(rule.some(i => i.type === 'decl' && i.prop === 'c')).toBe(false)
})

it('index() returns child index', () => {
  let rule = parse('a { a: 1; b: 2 }').first as Rule
  expect(rule.index(rule.nodes[1])).toEqual(1)
})

it('index() returns argument if it is number', () => {
  let rule = parse('a { a: 1; b: 2 }').first as Rule
  expect(rule.index(2)).toEqual(2)
})

it('first() works for children-less nodes', () => {
  let atRule = parse('@charset "UTF-*"').first as AtRule
  expect(atRule.first).toBeUndefined()
})

it('last() works for children-less nodes', () => {
  let atRule = parse('@charset "UTF-*"').first as AtRule
  expect(atRule.last).toBeUndefined()
})

it('returns first child', () => {
  let rule = parse('a { a: 1; b: 2 }').first as Rule
  let aDecl = rule.first as Declaration
  expect(aDecl.prop).toEqual('a')
})

it('returns last child', () => {
  let rule = parse('a { a: 1; b: 2 }').first as Rule
  let bDecl = rule.last as Declaration
  expect(bDecl.prop).toEqual('b')
})

it('normalize() does not normalize new children with exists before', () => {
  let rule = parse('a { a: 1; b: 2 }').first as Rule
  rule.append({ prop: 'c', value: '3', raws: { before: '\n ' } })
  expect(rule.toString()).toEqual('a { a: 1; b: 2;\n c: 3 }')
})

it('forces Declaration#value to be string', () => {
  let rule = parse('a { a: 1; b: 2 }').first as Rule
  // @ts-expect-error
  rule.append({ prop: 'c', value: 3 })
  let aDecl = rule.first as Declaration
  let cDecl = rule.last as Declaration
  expect(typeof aDecl.value).toEqual('string')
  expect(typeof cDecl.value).toEqual('string')
})

it('updates parent in overrides.nodes in constructor', () => {
  let root = new Root({ nodes: [{ selector: 'a' }] })
  let a = root.first as Rule
  expect(a.parent).toBe(root)

  root.append({
    selector: 'b',
    nodes: [{ prop: 'color', value: 'black' }]
  })
  let b = root.last as Rule
  let color = b.first as Declaration
  expect(color.parent).toBe(root.last)
})

it('allows to clone nodes', () => {
  let root1 = parse('a { color: black; z-index: 1 } b {}')
  let root2 = new Root({ nodes: root1.nodes })
  expect(root1.toString()).toEqual('a { color: black; z-index: 1 } b {}')
  expect(root2.toString()).toEqual('a { color: black; z-index: 1 } b {}')
})
