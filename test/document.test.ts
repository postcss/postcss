import { test } from 'uvu'
import { is, match, type } from 'uvu/assert'

import Document from '../lib/document.js'
import { parse, Result } from '../lib/postcss.js'

test('generates result without map', () => {
  let root = parse('a {}')
  let document = new Document()

  document.append(root)

  let result = document.toResult()

  is(result instanceof Result, true)
  is(result.css, 'a {}')
})

test('generates result with map', () => {
  let root = parse('a {}')
  let document = new Document()

  document.append(root)

  let result = document.toResult({ map: true })

  is(result instanceof Result, true)
  match(result.css, /a {}\n\/\*# sourceMappingURL=/)
})

test('toJSON() cleans parents inside', () => {
  let root = parse('.a { color: #434e59; }')
  let document = new Document()

  // @ts-expect-error
  // see: https://github.com/ota-meshi/postcss-html/issues/146
  root.document = document

  document.append(root)

  let json = document.toJSON() as any
  type(json.parent, 'undefined')
  type(json.nodes[0].parent, 'undefined')

  is(
    JSON.stringify(document, (key, value) => {
      if (key === 'id' && value.startsWith('<input css')) {
        return null
      }

      return value
    }),
    '{"raws":{},"type":"document","nodes":[{"raws":{"semicolon":false,"after":""},"type":"root","nodes":[{"raws":{"before":"","between":" ","semicolon":true,"after":" "},"type":"rule","nodes":[{"raws":{"before":" ","between":": "},"type":"decl","source":{"end":{"column":20,"line":1,"offset":20},"inputId":0,"start":{"column":6,"line":1,"offset":5}},"prop":"color","value":"#434e59"}],"source":{"end":{"column":22,"line":1,"offset":22},"inputId":0,"start":{"column":1,"line":1,"offset":0}},"selector":".a"}],"source":{"end":{"column":23,"line":1,"offset":22},"inputId":0,"start":{"column":1,"line":1,"offset":0}}}],"inputs":[{"hasBOM":false,"css":".a { color: #434e59; }","id":null}]}'
  )
})

test.run()
