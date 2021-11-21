import { test } from 'uvu'
import { is } from 'uvu/assert'

import { Comment, parse } from '../lib/postcss.js'

test('toString() inserts default spaces', () => {
  let comment = new Comment({ text: 'hi' })
  is(comment.toString(), '/* hi */')
})

test('toString() clones spaces from another comment', () => {
  let root = parse('a{} /*hello*/')
  let comment = new Comment({ text: 'world' })
  root.append(comment)

  is(root.toString(), 'a{} /*hello*/ /*world*/')
})

test.run()
