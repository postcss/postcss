/* eslint-disable @typescript-eslint/no-var-requires */
import { bold, red, gray, yellow } from 'nanocolors'

beforeEach(() => {
  jest.resetModules()
  jest.doMock('fs', () => ({}))
  jest.doMock('nanocolors', () => ({ bold, red, gray, yellow }))
})

it('shows code with colors', () => {
  let postcss = require('../lib/postcss.js')

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
  expect(error.showSourceCode(true)).toEqual(
    bold(red('>')) +
      gray(' 1 | ') +
      'a' +
      yellow('{') +
      '\n ' +
      gray('   | ') +
      bold(red('^'))
  )
})

it('shows code without colors', () => {
  let postcss = require('../lib/postcss.js')

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
  let postcss = require('../lib/postcss.js')

  expect(
    postcss([() => {}]).process('a{}', { from: 'a.css', map: true }).css
  ).toEqual(
    'a{}\n/*# sourceMappingURL=data:application/json;base64,' +
      'eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImEuY3NzIl0sIm5hbWVzIjpbXSw' +
      'ibWFwcGluZ3MiOiJBQUFBLEVBQUUiLCJmaWxlIjoiYS5jc3MiLCJzb3VyY2' +
      'VzQ29udGVudCI6WyJhe30iXX0= */'
  )
})

it(`doesn't throw error without path`, () => {
  jest.doMock('path', () => ({}))
  let postcss = require('../lib/postcss.js')

  expect(
    postcss([() => {}]).process('a{}', { from: 'a.css', map: true }).css
  ).toEqual('a{}')
})
