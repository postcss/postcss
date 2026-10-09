import { test } from 'uvu'
import { equal, is } from 'uvu/assert'

import { fromJSON, Input, parse, Root, Rule } from '../lib/postcss.js'

function embeddedRoot(): Root {
  let css = 'a { color: red }'
  let document = '<style>\n' + css + '\n</style>'
  let root = parse(css, { document, from: 'embedded.html' })
  let rule = root.first as Rule
  rule.source = {
    end: { column: 16, line: 2, offset: 24 },
    input: rule.source!.input,
    start: { column: 1, line: 2, offset: 8 }
  }
  return root
}

test('serializes the enclosing input document', () => {
  let input = new Input('a {}', { document: '<style>a {}</style>' })
  let json = JSON.parse(JSON.stringify(input))
  is(json.css, 'a {}')
  is(json.document, '<style>a {}</style>')
})

test('preserves embedded source positions through a JSON roundtrip', () => {
  let root = embeddedRoot()
  let restored = fromJSON(JSON.parse(JSON.stringify(root))) as Root
  let rule = restored.first as Rule
  is(restored.source!.input.document, root.source!.input.document)
  is(rule.source!.input, restored.source!.input)
  equal(rule.positionBy({ word: 'red' }), {
    column: 12,
    line: 2,
    offset: 19
  })
  equal(rule.rangeBy({ word: 'red' }), {
    end: { column: 15, line: 2, offset: 22 },
    start: { column: 12, line: 2, offset: 19 }
  })
  equal(rule.positionInside(17), { column: 1, line: 3, offset: 25 })
  is(restored.toString(), root.toString())
})

test('keeps ordinary CSS input JSON compact and old JSON readable', () => {
  let input = new Input('a {}')
  let json = JSON.parse(JSON.stringify(input))
  is('document' in json, false)
  let root = parse('a { color: red }')
  let restored = fromJSON(JSON.parse(JSON.stringify(root))) as Root
  equal(restored.first!.positionBy({ word: 'red' }), {
    column: 12,
    line: 1,
    offset: 11
  })
})

test('retains separate enclosing sources in arrays of roots', () => {
  let roots = [embeddedRoot(), parse('b {}', { document: '<style>b {}</style>' })]
  let restored = fromJSON(JSON.parse(JSON.stringify(roots))) as unknown as Root[]
  is(restored[0].source!.input.document, '<style>\na { color: red }\n</style>')
  is(restored[1].source!.input.document, '<style>b {}</style>')
  is(restored[0].source!.input === restored[1].source!.input, false)
})

test.run()
