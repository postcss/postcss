import { readFileSync } from 'fs'
import { resolve } from 'path'
import { eachTest, jsonify, testPath } from 'postcss-parser-tests'
import { test } from 'uvu'
import { equal, is, match, not, throws } from 'uvu/assert'

import { AtRule, Declaration, parse, Root, Rule } from '../lib/postcss.js'

test('works with file reads', () => {
  let stream = readFileSync(testPath('atrule-empty.css'))
  is(parse(stream) instanceof Root, true)
})

eachTest((name, css, json) => {
  test(`parses ${name}`, () => {
    css = css.replace(/\r\n/g, '\n')
    let parsed = jsonify(parse(css, { from: name }))
    equal(parsed, json)
  })
})

test('parses UTF-8 BOM', () => {
  let css = parse('\uFEFF@host { a {\f} }')
  equal(css.nodes[0].raws.before, '')
})

test('should has true at hasBOM property', () => {
  let css = parse('\uFEFF@host { a {\f} }')
  is(css.first?.source?.input.hasBOM, true)
})

test('should has false at hasBOM property', () => {
  let css = parse('@host { a {\f} }')
  is(css.first?.source?.input.hasBOM, false)
})

test('parses carrier return', () => {
  throws(() => {
    parse('@font-face{ font:(\r/*);} body { a: "a*/)} a{}"}')
  }, /:1:46: Unclosed string/)
})

test('saves source file', () => {
  let css = parse('a {}', { from: 'a.css' })
  is(css.first?.source?.input.css, 'a {}')
  is(css.first?.source?.input.file, resolve('a.css'))
  is(css.first?.source?.input.from, resolve('a.css'))
})

test('keeps absolute path in source', () => {
  let css = parse('a {}', { from: 'http://example.com/a.css' })
  is(css.first?.source?.input.file, 'http://example.com/a.css')
  is(css.first?.source?.input.from, 'http://example.com/a.css')
})

test('saves source file on previous map', () => {
  let root1 = parse('a {}', { map: { inline: true } })
  let css = root1.toResult({ map: { inline: true } }).css
  let root2 = parse(css)
  is(root2.first?.source?.input.file, resolve('to.css'))
})

test('sets unique ID for file without name', () => {
  let css1 = parse('a {}')
  let css2 = parse('a {}')
  match(String(css1.first?.source?.input.id), /^<input css [\w-]+>$/)
  match(String(css1.first?.source?.input.from), /^<input css [\w-]+>$/)
  is.not(css2.first?.source?.input.id, css1.first?.source?.input.id)
})

test('sets parent node', () => {
  let file = testPath('atrule-rules.css')
  let css = parse(readFileSync(file))

  let support = css.first as AtRule
  let keyframes = support.first as AtRule
  let from = keyframes.first as Rule
  let decl = from.first as Declaration

  is(decl.parent, from)
  is(from.parent, keyframes)
  is(support.parent, css)
  is(keyframes.parent, support)
})

test('ignores wrong close bracket', () => {
  let root = parse('a { p: ()) }')
  let a = root.first as Rule
  let decl = a.first as Declaration
  is(decl.value, '())')
})

test('parses unofficial --mixins', () => {
  let root = parse(':root { --x { color: pink; }; }')
  let rule = root.first as Rule
  let prop = rule.first as Rule
  is(prop.selector, '--x')
})

test('ignores symbols before declaration', () => {
  let root = parse('a { :one: 1 }')
  let a = root.first as Rule
  let prop = a.first as Declaration
  is(prop.raws.before, ' :')
})

test('parses double semicolon after rule', () => {
  is(parse('a { };;').toString(), 'a { };;')
})

test('parses a functional property', () => {
  let root = parse('a { b(c): d }')
  let a = root.first as Rule
  let b = a.first as Declaration

  is(b.prop, 'b(c)')
})

test('parses a functional tagname', () => {
  let root = parse('a { b(c): d {} }')
  let a = root.first as Rule
  let b = a.first as Rule

  is(b.selector, 'b(c): d')
})

test('throws on unclosed blocks', () => {
  throws(() => {
    parse('\na {\n')
  }, /:2:1: Unclosed block/)
})

test('throws on unnecessary block close', () => {
  throws(() => {
    parse('a {\n} }')
  }, /:2:3: Unexpected }/)
})

test('throws on unclosed comment', () => {
  throws(() => {
    parse('\n/*\n ')
  }, /:2:1: Unclosed comment/)
})

test('throws on unclosed quote', () => {
  throws(() => {
    parse('\n"\n\na ')
  }, /:2:1: Unclosed string/)
})

test('throws on unclosed bracket', () => {
  throws(() => {
    parse(':not(one() { }')
  }, /:1:5: Unclosed bracket/)
})

test('throws on property without value', () => {
  throws(() => {
    parse('a { b;}')
  }, /:1:5: Unknown word/)
  throws(() => {
    parse('a { b b }')
  }, /:1:5: Unknown word/)
  throws(() => {
    parse('a { b(); }')
  }, /:1:5: Unknown word/)
})

test('throws on nameless at-rule', () => {
  throws(() => {
    parse('@')
  }, /:1:1: At-rule without name/)
})

test('throws on property without semicolon', () => {
  throws(() => {
    parse('a { one: filter(a:"") two: 2 }')
  }, /:1:21: Missed semicolon/)
})

test('throws on double colon', () => {
  throws(() => {
    parse('a { one:: 1 }')
  }, /:1:9: Double colon/)
})

test('do not throws on comment in between', () => {
  parse('a { b/* c */: 1 }')
})

test('throws on two words in between', () => {
  throws(() => {
    parse('a { b c: 1 }')
  }, /:1:7: Unknown word/)
})

test('throws on just colon', () => {
  throws(() => {
    parse(':')
  }, /:1:1: Unknown word/)
  throws(() => {
    parse(' : ')
  }, /:1:2: Unknown word/)
})

test('does not suggest different parsers for CSS', () => {
  let error: any
  try {
    parse('a { one:: 1 }', { from: 'app.css' })
  } catch (e) {
    error = e
  }
  not.match(error.message, /postcss-less|postcss-scss/)
})

test('suggests postcss-scss for SCSS sources', () => {
  throws(() => {
    parse('a { #{var}: 1 }', { from: 'app.scss' })
  }, /postcss-scss/)
})

test('suggests postcss-sass for Sass sources', () => {
  throws(() => {
    parse('a\n  #{var}: 1', { from: 'app.sass' })
  }, /postcss-sass/)
})

test('suggests postcss-less for Less sources', () => {
  throws(() => {
    parse('.@{my-selector} { }', { from: 'app.less' })
  }, /postcss-less/)
})

test('should give the correct column of missed semicolon with !important', () => {
  let error: any
  try {
    parse('a { \n    color: red !important\n    background-color: black;\n}')
  } catch (e) {
    error = e
  }
  match(error.message, /2:26: Missed semicolon/)
})

test('should give the correct column of missed semicolon without !important', () => {
  let error: any
  try {
    parse('a { \n    color: red\n    background-color: black;\n}')
  } catch (e) {
    error = e
  }
  match(error.message, /2:15: Missed semicolon/)
})

test.run()
