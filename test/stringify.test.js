let cases = require('postcss-parser-tests')

let stringify = require('../lib/stringify')
let parse = require('../lib/parse')

cases.each((name, css) => {
  if (name === 'bom.css') return

  it('stringifies ' + name, () => {
    let root = parse(css)
    let result = ''
    stringify(root, i => {
      result += i
    })
    expect(result).toEqual(css)
  })
})
