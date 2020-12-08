import v8 from 'v8'

import postcss, { Root } from '../lib/postcss.js'

it('rehydrates a JSON AST', () => {
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
  let rehydrated = postcss.fromJSON(deserialized) as Root

  rehydrated.nodes[0].remove()

  expect(rehydrated.nodes).toHaveLength(3)

  expect(
    postcss().process(rehydrated, {
      from: undefined,
      map: {
        inline: true
      },
      stringifier: postcss.stringify
    }).css
  ).toBe(`/* abc */ @media (width: 60em) { }
/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInguY3NzIiwiPG5vIHNvdXJjZT4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQXNDLFNDQXRDLENEQWdELHdCQ0FoRCIsImZpbGUiOiJ0by5jc3MiLCJzb3VyY2VzQ29udGVudCI6WyIuZm9vIHsgY29sb3I6IHJlZDsgZm9udC1zaXplOiAxMnB0OyB9IC8qIGFiYyAqLyBAbWVkaWEgKHdpZHRoOiA2MGVtKSB7IH0iLG51bGxdfQ== */`)
})

it('throws when rehydrating an invalid JSON AST', () => {
  expect(() => {
    postcss.fromJSON({ type: 'not-a-node-type' })
  }).toThrow('Unknown node type: not-a-node-type')
})
