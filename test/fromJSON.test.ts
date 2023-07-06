import { test } from 'uvu'
import { instance, is, throws } from 'uvu/assert'
import * as v8 from 'v8'

import postcss, { Declaration, Input, Root, Rule } from '../lib/postcss.js'

test('rehydrates a JSON AST', () => {
  let cssWithMap = postcss().process(
    '.foo { color: red; font-size: 12pt; } /* abc */ @media (width: 60em) { }',
    {
      from: 'x.css',
      map: {
        inline: true
      },
      stringifier: postcss.stringify
    }
  ).css

  let root = postcss.parse(cssWithMap)

  let json = root.toJSON()
  let serialized = v8.serialize(json)
  let deserialized = v8.deserialize(serialized)
  let rehydrated = postcss.fromJSON(deserialized as object) as Root

  rehydrated.nodes[0].remove()

  is(rehydrated.nodes.length, 3)

  is(
    postcss().process(rehydrated, {
      from: undefined,
      map: {
        inline: true
      },
      stringifier: postcss.stringify
    }).css,
    `/* abc */ @media (width: 60em) { }
/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInguY3NzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFzQyxRQUFRLEVBQUUsdUJBQXVCIiwiZmlsZSI6InRvLmNzcyIsInNvdXJjZXNDb250ZW50IjpbIi5mb28geyBjb2xvcjogcmVkOyBmb250LXNpemU6IDEycHQ7IH0gLyogYWJjICovIEBtZWRpYSAod2lkdGg6IDYwZW0pIHsgfSJdfQ== */`
  )
})

test('rehydrates an array of Nodes via JSON.stringify', () => {
  let root = postcss.parse('.cls { color: orange; }')

  let rule = root.first as Rule
  let json = JSON.stringify(rule.nodes)
  let rehydrated = postcss.fromJSON(JSON.parse(json)) as any
  instance(rehydrated[0], Declaration)
  instance(rehydrated[0].source?.input, Input)
})

test('throws when rehydrating an invalid JSON AST', () => {
  throws(() => {
    postcss.fromJSON({ type: 'not-a-node-type' })
  }, 'Unknown node type: not-a-node-type')
})

test.run()
