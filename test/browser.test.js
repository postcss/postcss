jest.doMock('fs', () => ({ }))
jest.doMock('chalk', () => ({ }))
jest.doMock('supports-color', () => ({ }))

let postcss = require('..')

it('shows code without chalk', () => {
  let error
  try {
    postcss.parse('a{')
  } catch (e) {
    if (e.name === 'CssSyntaxError') {
      error = e
    } else {
      throw e
    }
  }
  expect(error.showSourceCode(true)).toEqual('> 1 | a{\n' +
                                             '    | ^')
})

it('generates source map without fs', () => {
  expect(postcss([() => true]).process('a{}', { from: 'a.css', map: true }).css)
    .toEqual('a{}\n/*# sourceMappingURL=data:application/json;base64,' +
             'eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImEuY3NzIl0sIm5hbWVzIjpbXSw' +
             'ibWFwcGluZ3MiOiJBQUFBLEVBQUUiLCJmaWxlIjoiYS5jc3MiLCJzb3VyY2' +
             'VzQ29udGVudCI6WyJhe30iXX0= */')
})
