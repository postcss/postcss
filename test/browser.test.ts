import { options, bold, red, gray, yellow } from 'colorette'

import postcss from '../lib/postcss.js'

jest.doMock('fs', () => ({}))
jest.doMock('colorette', () => ({ options, bold, red, gray, yellow }))

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
  expect(error.showSourceCode()).toEqual(
    bold(red('>')) +
      gray(' 1 | ') +
      'a' +
      yellow('{') +
      '\n ' +
      gray('   | ') +
      bold(red('^'))
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
    postcss([() => {}]).process('a{}', { from: 'a.css', map: true }).css
  ).toEqual(
    'a{}\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImEuY3NzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLEVBQUU7QTtBIiwiZmlsZSI6ImEuY3NzIiwic291cmNlc0NvbnRlbnQiOlsiYXt9Il19 */\n'
  )
})
