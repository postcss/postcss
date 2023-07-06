import { eachTest } from 'postcss-parser-tests'
import { test } from 'uvu'
import { is } from 'uvu/assert'

import { parse, stringify } from '../lib/postcss.js'

eachTest((name, css) => {
  if (name === 'bom.css') return

  test(`stringifies ${name}`, () => {
    let root = parse(css)
    let result = ''
    stringify(root, i => {
      result += i
    })
    is(result, css)
  })
})

test.run()
