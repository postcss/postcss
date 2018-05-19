const Comment = require('../lib/comment')
const parse = require('../lib/parse')

it('toString() inserts default spaces', () => {
  const comment = new Comment({ text: 'hi' })
  expect(comment.toString()).toEqual('/* hi */')
})

it('toString() clones spaces from another comment', () => {
  const root = parse('a{} /*hello*/')
  const comment = new Comment({ text: 'world' })
  root.append(comment)

  expect(root.toString()).toEqual('a{} /*hello*/ /*world*/')
})
