let { options, ...colors } = require('colorette')

jest.doMock('fs', () => ({}))
jest.doMock('colorette', () => ({ options, ...colors }))

let postcss = require('..')

afterEach(() => {
  options.enabled = true
})

it('shows code with colors (default)', () => {
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
  let c = colors
  expect(error.showSourceCode()).toEqual(
    c.bold(c.red('>')) +
      c.gray(' 1 | ') +
      'a' +
      c.yellow('{') +
      '\n ' +
      c.gray('   | ') +
      c.bold(c.red('^'))
  )
})

it('shows code without colors (default)', () => {
  let error
  options.enabled = false

  try {
    postcss.parse('a{')
  } catch (e) {
    if (e.name === 'CssSyntaxError') {
      error = e
    } else {
      throw e
    }
  }
  expect(error.showSourceCode()).toEqual('> 1 | a{\n' + '    | ^')
})

it('shows code without colors (setting)', () => {
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
  expect(error.showSourceCode(false)).toEqual('> 1 | a{\n' + '    | ^')
})

it('generates source map without fs', () => {
  expect(
    postcss([() => true]).process('a{}', { from: 'a.css', map: true }).css
  ).toEqual(
    'a{}\n/*# sourceMappingURL=data:application/json;base64,' +
      'eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImEuY3NzIl0sIm5hbWVzIjpbXSw' +
      'ibWFwcGluZ3MiOiJBQUFBLEVBQUUiLCJmaWxlIjoiYS5jc3MiLCJzb3VyY2' +
      'VzQ29udGVudCI6WyJhe30iXX0= */'
  )
})
