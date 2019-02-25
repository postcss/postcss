let parse = require('../lib/parse')
let Root = require('../lib/root')

let cases = require('postcss-parser-tests')
let path = require('path')
let fs = require('fs')

it('works with file reads', () => {
  let stream = fs.readFileSync(cases.path('atrule-empty.css'))
  expect(parse(stream) instanceof Root).toBeTruthy()
})

cases.each((name, css, json) => {
  it('parses ' + name, () => {
    let parsed = cases.jsonify(parse(css, { from: name }))
    expect(JSON.parse(parsed)).toEqual(JSON.parse(json))
  })
})

it('parses UTF-8 BOM', () => {
  let css = parse('\uFEFF@host { a {\f} }')
  expect(css.nodes[0].raws.before).toEqual('')
})

it('should has true at `hasBOM` property', () => {
  let css = parse('\uFEFF@host { a {\f} }')
  expect(css.first.source.input.hasBOM).toBeTruthy()
})

it('should has false at `hasBOM` property', () => {
  let css = parse('@host { a {\f} }')
  expect(css.first.source.input.hasBOM).toBeFalsy()
})

it('saves source file', () => {
  let css = parse('a {}', { from: 'a.css' })
  expect(css.first.source.input.css).toEqual('a {}')
  expect(css.first.source.input.file).toEqual(path.resolve('a.css'))
  expect(css.first.source.input.from).toEqual(path.resolve('a.css'))
})

it('keeps absolute path in source', () => {
  let css = parse('a {}', { from: 'http://example.com/a.css' })
  expect(css.first.source.input.file).toEqual('http://example.com/a.css')
  expect(css.first.source.input.from).toEqual('http://example.com/a.css')
})

it('saves source file on previous map', () => {
  let root1 = parse('a {}', { map: { inline: true } })
  let css = root1.toResult({ map: { inline: true } }).css
  let root2 = parse(css)
  expect(root2.first.source.input.file).toEqual(path.resolve('to.css'))
})

it('sets unique ID for file without name', () => {
  let css1 = parse('a {}')
  let css2 = parse('a {}')
  expect(css1.first.source.input.id).toMatch(/^<input css \d+>$/)
  expect(css1.first.source.input.from).toMatch(/^<input css \d+>$/)
  expect(css2.first.source.input.id).not.toEqual(css1.first.source.input.id)
})

it('sets parent node', () => {
  let file = cases.path('atrule-rules.css')
  let css = parse(fs.readFileSync(file))

  let support = css.first
  let keyframes = support.first
  let from = keyframes.first
  let decl = from.first

  expect(decl.parent).toBe(from)
  expect(from.parent).toBe(keyframes)
  expect(support.parent).toBe(css)
  expect(keyframes.parent).toBe(support)
})

it('ignores wrong close bracket', () => {
  let root = parse('a { p: ()) }')
  expect(root.first.first.value).toEqual('())')
})

it('ignores symbols before declaration', () => {
  let root = parse('a { :one: 1 }')
  expect(root.first.first.raws.before).toEqual(' :')
})

it('parses double semicolon after rule', () => {
  expect(parse('a { };;').toString()).toEqual('a { };;')
})

it('throws on unclosed blocks', () => {
  expect(() => {
    parse('\na {\n')
  }).toThrowError(/:2:1: Unclosed block/)
})

it('throws on unnecessary block close', () => {
  expect(() => {
    parse('a {\n} }')
  }).toThrowError(/:2:3: Unexpected }/)
})

it('throws on unclosed comment', () => {
  expect(() => {
    parse('\n/*\n ')
  }).toThrowError(/:2:1: Unclosed comment/)
})

it('throws on unclosed quote', () => {
  expect(() => {
    parse('\n"\n\na ')
  }).toThrowError(/:2:1: Unclosed string/)
})

it('throws on unclosed bracket', () => {
  expect(() => {
    parse(':not(one() { }')
  }).toThrowError(/:1:5: Unclosed bracket/)
})

it('throws on property without value', () => {
  expect(() => {
    parse('a { b;}')
  }).toThrowError(/:1:5: Unknown word/)
  expect(() => {
    parse('a { b b }')
  }).toThrowError(/:1:5: Unknown word/)
})

it('throws on nameless at-rule', () => {
  expect(() => {
    parse('@')
  }).toThrowError(/:1:1: At-rule without name/)
})

it('throws on property without semicolon', () => {
  expect(() => {
    parse('a { one: filter(a:"") two: 2 }')
  }).toThrowError(/:1:21: Missed semicolon/)
})

it('throws on double colon', () => {
  expect(() => {
    parse('a { one:: 1 }')
  }).toThrowError(/:1:9: Double colon/)
})

it('do not throws on comment in between', () => {
  parse('a { b/* c */: 1 }')
})

it('throws on two words in between', () => {
  expect(() => {
    parse('a { b c: 1 }')
  }).toThrowError(/:1:7: Unknown word/)
})

it('throws on just colon', () => {
  expect(() => {
    parse(':')
  }).toThrowError(/:1:1: Unknown word/)
  expect(() => {
    parse(' : ')
  }).toThrowError(/:1:2: Unknown word/)
})

it('does not suggest different parsers for CSS', () => {
  let error
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
  }).toThrowError(/postcss-scss/)
})

it('suggests postcss-sass for Sass sources', () => {
  expect(() => {
    parse('a\n  #{var}: 1', { from: 'app.sass' })
  }).toThrowError(/postcss-sass/)
})

it('suggests postcss-less for Less sources', () => {
  expect(() => {
    parse('.@{my-selector} { }', { from: 'app.less' })
  }).toThrowError(/postcss-less/)
})
