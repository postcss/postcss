import v8 from 'v8'

import postcss, { Root } from '../lib/postcss.js'

it('can rehydrate a JSON AST', () => {
  let cssWithMap = postcss().process(
    '.foo { color: red; font-size: 12pt; } /* abc */ @media (width: 60em) { }',
    {
      from: undefined,
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
  // @ts-ignore
  let rehydrated: Root = postcss.fromJSON(deserialized)

  rehydrated.nodes[0].remove()

  expect(rehydrated.nodes).toHaveLength(3)
})
