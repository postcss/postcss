import { Comment, parse } from '../lib/postcss.js'

it('toString() inserts default spaces', () => {
  let comment = new Comment({ text: 'hi' })
  expect(comment.toString()).toBe('/* hi */')
})

it('toString() clones spaces from another comment', () => {
  let root = parse('a{} /*hello*/')
  let comment = new Comment({ text: 'world' })
  root.append(comment)

  expect(root.toString()).toBe('a{} /*hello*/ /*world*/')
})
