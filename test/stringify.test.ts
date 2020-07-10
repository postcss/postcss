import { eachTest } from 'postcss-parser-tests'

import stringify from '../lib/stringify.js'
import parse from '../lib/parse.js'

eachTest((name, css) => {
  if (name === 'bom.css') return

  it(`stringifies ${name}`, () => {
    let root = parse(css)
    let result = ''
    stringify(root, i => {
      result += i
    })
    expect(result).toEqual(css)
  })
})
