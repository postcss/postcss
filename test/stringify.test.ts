import { eachTest } from 'postcss-parser-tests'
import { test } from 'uvu'
import { is } from 'uvu/assert'

import Document from '../lib/document.js'
import { parse, stringify } from '../lib/postcss.js'

eachTest((name, css) => {
  test(`stringifies ${name}`, () => {
    let root = parse(css)
    let result = ''
    stringify(root, i => {
      result += i
    })
    is(result, css)
  })
})

test('preserves a single leading BOM', () => {
  is(parse('\uFEFFa{}').toString(), '\uFEFFa{}')
})

test('does not emit multiple BOM markers', () => {
  is(parse('\uFEFF\uFEFFa{}').toString(), '\uFEFFa{}')
  is(parse('\uFEFFa{}\uFEFFb{}').toString(), '\uFEFFa{}b{}')
  is(parse('a{}\uFEFFb{}').toString(), 'a{}b{}')
  is(parse('\uFEFFa{}\uFFFEb{}').toString(), '\uFEFFa{}b{}')
  is(parse('a{}\uFEFF').toString(), 'a{}')
})

test('emits a single BOM for a document of BOM roots', () => {
  let document = new Document()
  document.append(parse('\uFEFFa{}'))
  document.append(parse('\uFEFFb{}'))
  is(document.toString(), '\uFEFFa{}b{}')
})

test.run()
