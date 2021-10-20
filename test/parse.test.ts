import { testPath, jsonify, eachTest } from 'postcss-parser-tests'
import { readFileSync } from 'fs'
import { resolve } from 'path'

import { Declaration, AtRule, parse, Root, Rule } from '../lib/postcss.js'

it('works with file reads', () => {
  let stream = readFileSync(testPath('atrule-empty.css'))
  expect(parse(stream) instanceof Root).toBe(true)
})

eachTest((name, css, json) => {
  it(`parses ${name}`, () => {
    css = css.replace(/\r\n/g, '\n')
    let parsed = jsonify(parse(css, { from: name }))
    expect(JSON.parse(parsed)).toEqual(JSON.parse(json))
  })
})

it('parses UTF-8 BOM', () => {
  let css = parse('\uFEFF@host { a {\f} }')
  expect(css.nodes[0].raws.before).toBe('')
})

it('should has true at `hasBOM` property', () => {
  let css = parse('\uFEFF@host { a {\f} }')
  expect(css.first?.source?.input.hasBOM).toBe(true)
})

it('should has false at `hasBOM` property', () => {
  let css = parse('@host { a {\f} }')
  expect(css.first?.source?.input.hasBOM).toBe(false)
})

it('saves source file', () => {
  let css = parse('a {}', { from: 'a.css' })
  expect(css.first?.source?.input.css).toBe('a {}')
  expect(css.first?.source?.input.file).toEqual(resolve('a.css'))
  expect(css.first?.source?.input.from).toEqual(resolve('a.css'))
})

it('keeps absolute path in source', () => {
  let css = parse('a {}', { from: 'http://example.com/a.css' })
  expect(css.first?.source?.input.file).toBe('http://example.com/a.css')
  expect(css.first?.source?.input.from).toBe('http://example.com/a.css')
})

it('saves source file on previous map', () => {
  let root1 = parse('a {}', { map: { inline: true } })
  let css = root1.toResult({ map: { inline: true } }).css
  let root2 = parse(css)
  expect(root2.first?.source?.input.file).toEqual(resolve('to.css'))
})

it('sets unique ID for file without name', () => {
  let css1 = parse('a {}')
  let css2 = parse('a {}')
  expect(css1.first?.source?.input.id).toMatch(/^<input css [\w-]+>$/)
  expect(css1.first?.source?.input.from).toMatch(/^<input css [\w-]+>$/)
  expect(css2.first?.source?.input.id).not.toEqual(css1.first?.source?.input.id)
})

it('sets parent node', () => {
  let file = testPath('atrule-rules.css')
  let css = parse(readFileSync(file))

  let support = css.first as AtRule
  let keyframes = support.first as AtRule
  let from = keyframes.first as Rule
  let decl = from.first as Declaration

  expect(decl.parent).toBe(from)
  expect(from.parent).toBe(keyframes)
  expect(support.parent).toBe(css)
  expect(keyframes.parent).toBe(support)
})

it('ignores wrong close bracket', () => {
  let root = parse('a { p: ()) }')
  let a = root.first as Rule
  let decl = a.first as Declaration
  expect(decl.value).toBe('())')
})

it('parses unofficial --mixins', () => {
  let root = parse(':root { --x { color: pink; }; }')
  let rule = root.first as Rule
  let prop = rule.first as Rule
  expect(prop.selector).toBe('--x')
})

it('ignores symbols before declaration', () => {
  let root = parse('a { :one: 1 }')
  let a = root.first as Rule
  let prop = a.first as Declaration
  expect(prop.raws.before).toBe(' :')
})

it('parses double semicolon after rule', () => {
  expect(parse('a { };;').toString()).toBe('a { };;')
})

it('throws on unclosed blocks', () => {
  expect(() => {
    parse('\na {\n')
  }).toThrow(/:2:1: Unclosed block/)
})

it('throws on unnecessary block close', () => {
  expect(() => {
    parse('a {\n} }')
  }).toThrow(/:2:3: Unexpected }/)
})

it('throws on unclosed comment', () => {
  expect(() => {
    parse('\n/*\n ')
  }).toThrow(/:2:1: Unclosed comment/)
})

it('throws on unclosed quote', () => {
  expect(() => {
    parse('\n"\n\na ')
  }).toThrow(/:2:1: Unclosed string/)
})

it('throws on unclosed bracket', () => {
  expect(() => {
    parse(':not(one() { }')
  }).toThrow(/:1:5: Unclosed bracket/)
})

it('throws on property without value', () => {
  expect(() => {
    parse('a { b;}')
  }).toThrow(/:1:5: Unknown word/)
  expect(() => {
    parse('a { b b }')
  }).toThrow(/:1:5: Unknown word/)
})

it('throws on nameless at-rule', () => {
  expect(() => {
    parse('@')
  }).toThrow(/:1:1: At-rule without name/)
})

it('throws on property without semicolon', () => {
  expect(() => {
    parse('a { one: filter(a:"") two: 2 }')
  }).toThrow(/:1:21: Missed semicolon/)
})

it('throws on double colon', () => {
  expect(() => {
    parse('a { one:: 1 }')
  }).toThrow(/:1:9: Double colon/)
})

it('do not throws on comment in between', () => {
  parse('a { b/* c */: 1 }')
})

it('throws on two words in between', () => {
  expect(() => {
    parse('a { b c: 1 }')
  }).toThrow(/:1:7: Unknown word/)
})

it('throws on just colon', () => {
  expect(() => {
    parse(':')
  }).toThrow(/:1:1: Unknown word/)
  expect(() => {
    parse(' : ')
  }).toThrow(/:1:2: Unknown word/)
})

it('does not suggest different parsers for CSS', () => {
  let error: any
  try {
    parse('a { one:: 1 }', { from: 'app.css' })
  } catch (e) {
    error = e
  }
  expect(error.message).not.toMatch(/postcss-less|postcss-scss/)
})

it('suggests postcss-scss for SCSS sources', () => {
  expect(() => {
    parse('a { #{var}: 1 }', { from: 'app.scss' })
  }).toThrow(/postcss-scss/)
})

it('suggests postcss-sass for Sass sources', () => {
  expect(() => {
    parse('a\n  #{var}: 1', { from: 'app.sass' })
  }).toThrow(/postcss-sass/)
})

it('suggests postcss-less for Less sources', () => {
  expect(() => {
    parse('.@{my-selector} { }', { from: 'app.less' })
  }).toThrow(/postcss-less/)
})

it('should give the correct column of missed semicolon with !important', () => {
  let error: any
  try {
    parse('a { \n    color: red !important\n    background-color: black;\n}')
  } catch (e) {
    error = e
  }
  expect(error.message).toMatch(/2:26: Missed semicolon/)
})

it('should give the correct column of missed semicolon without !important', () => {
  let error: any
  try {
    parse('a { \n    color: red\n    background-color: black;\n}')
  } catch (e) {
    error = e
  }
  expect(error.message).toMatch(/2:15: Missed semicolon/)
})
