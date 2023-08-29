import { test } from 'uvu'
import { equal } from 'uvu/assert'

import {
  AtRule,
  Comment,
  Declaration,
  Node,
  parse,
  Rule
} from '../lib/postcss.js'

function checkOffset(source: string, node: Node, expected: string): void {
  let start = node.source!.start!.offset
  let end = node.source!.end!.offset
  equal(source.slice(start, end), expected)
}

test('rule', () => {
  let source = '.a{}'
  let css = parse(source)

  let rule = css.first as Rule
  checkOffset(source, rule, '.a{}')
  equal(rule.source!.start, {
    column: 1,
    line: 1,
    offset: 0
  })
  equal(rule.source!.end, {
    column: 4,
    line: 1,
    offset: 4
  })
})

test('single decl (no semicolon)', () => {
  let source = '.a{b:c}'
  let css = parse(source)

  let rule = css.first as Rule
  let decl = rule.first as Declaration
  checkOffset(source, rule, '.a{b:c}')
  checkOffset(source, decl, 'b:c')
  equal(rule.source!.start, {
    column: 1,
    line: 1,
    offset: 0
  })
  equal(rule.source!.end, {
    column: 7,
    line: 1,
    offset: 7
  })
  equal(decl.source!.start, {
    column: 4,
    line: 1,
    offset: 3
  })
  equal(decl.source!.end, {
    column: 6,
    line: 1,
    offset: 6
  })
})

test('single decl (with semicolon)', () => {
  let source = '.a{b:c;}'
  let css = parse(source)

  let rule = css.first as Rule
  let decl = rule.first as Declaration
  checkOffset(source, rule, '.a{b:c;}')
  checkOffset(source, decl, 'b:c;')
  equal(rule.source!.start, {
    column: 1,
    line: 1,
    offset: 0
  })
  equal(rule.source!.end, {
    column: 8,
    line: 1,
    offset: 8
  })
  equal(decl.source!.start, {
    column: 4,
    line: 1,
    offset: 3
  })
  equal(decl.source!.end, {
    column: 7,
    line: 1,
    offset: 7
  })
})

test('two decls', () => {
  let source = '.a{b:c;d:e}'
  let css = parse(source)

  let rule = css.first as Rule
  let decl1 = rule.first as Declaration
  let decl2 = decl1.next() as Declaration
  checkOffset(source, decl1, 'b:c;')
  checkOffset(source, decl2, 'd:e')
  equal(rule.source!.start, {
    column: 1,
    line: 1,
    offset: 0
  })
  equal(rule.source!.end, {
    column: 11,
    line: 1,
    offset: 11
  })
  equal(decl1.source!.start, {
    column: 4,
    line: 1,
    offset: 3
  })
  equal(decl1.source!.end, {
    column: 7,
    line: 1,
    offset: 7
  })
  equal(decl2.source!.start, {
    column: 8,
    line: 1,
    offset: 7
  })
  equal(decl2.source!.end, {
    column: 10,
    line: 1,
    offset: 10
  })
})

test('...rule nested in rule', () => {
  let source = '.a{.b{}}'
  let css = parse(source)

  let rule = css.first as Rule
  let rule2 = rule.first as Rule
  checkOffset(source, rule, '.a{.b{}}')
  checkOffset(source, rule2, '.b{}')
  equal(rule.source!.start, {
    column: 1,
    line: 1,
    offset: 0
  })
  equal(rule.source!.end, {
    column: 8,
    line: 1,
    offset: 8
  })
  equal(rule2.source!.start, {
    column: 4,
    line: 1,
    offset: 3
  })
  equal(rule2.source!.end, {
    column: 7,
    line: 1,
    offset: 7
  })
})

test('at-rule with semicolon', () => {
  let source = '@a b;'
  let css = parse(source)

  let atrule = css.first as AtRule
  checkOffset(source, atrule, '@a b;')
  equal(atrule.source!.start, {
    column: 1,
    line: 1,
    offset: 0
  })
  equal(atrule.source!.end, {
    column: 5,
    line: 1,
    offset: 5
  })
})

test('unclosed at-rule', () => {
  let source = '@a b'
  let css = parse(source)

  let atrule = css.first as AtRule
  checkOffset(source, atrule, '@a b')
  equal(atrule.source!.start, {
    column: 1,
    line: 1,
    offset: 0
  })
  equal(atrule.source!.end, {
    column: 4,
    line: 1,
    offset: 4
  })
})

test('unclosed at-rule in at-rule', () => {
  let source = '@a{@b c}'
  let css = parse(source)

  let atrule = css.first as AtRule
  let atrule2 = atrule.first as AtRule
  checkOffset(source, atrule, '@a{@b c}')
  checkOffset(source, atrule2, '@b c')
  equal(atrule.source!.start, {
    column: 1,
    line: 1,
    offset: 0
  })
  equal(atrule.source!.end, {
    column: 8,
    line: 1,
    offset: 8
  })
  equal(atrule2.source!.start, {
    column: 4,
    line: 1,
    offset: 3
  })
  equal(atrule2.source!.end, {
    column: 7,
    line: 1,
    offset: 7
  })
})

test('at-rule with body', () => {
  let source = '@a{}'
  let css = parse(source)

  let atrule = css.first as AtRule
  checkOffset(source, atrule, '@a{}')
  equal(atrule.source!.start, {
    column: 1,
    line: 1,
    offset: 0
  })
  equal(atrule.source!.end, {
    column: 4,
    line: 1,
    offset: 4
  })
})

test('at-rule nested in atrule', () => {
  let source = '@a{@b{}}'
  let css = parse(source)

  let atrule = css.first as Rule
  let atrule2 = atrule.first as Rule
  checkOffset(source, atrule, '@a{@b{}}')
  checkOffset(source, atrule2, '@b{}')
  equal(atrule.source!.start, {
    column: 1,
    line: 1,
    offset: 0
  })
  equal(atrule.source!.end, {
    column: 8,
    line: 1,
    offset: 8
  })
  equal(atrule2.source!.start, {
    column: 4,
    line: 1,
    offset: 3
  })
  equal(atrule2.source!.end, {
    column: 7,
    line: 1,
    offset: 7
  })
})

test('comment', () => {
  let source = '/*a*/'
  let css = parse(source)

  let rule = css.first as Comment
  checkOffset(source, rule, '/*a*/')
  equal(rule.source!.start, {
    column: 1,
    line: 1,
    offset: 0
  })
  equal(rule.source!.end, {
    column: 5,
    line: 1,
    offset: 5
  })
})

test.run()
