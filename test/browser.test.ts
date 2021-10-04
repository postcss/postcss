/* eslint-disable @typescript-eslint/no-var-requires */
import pico from 'picocolors'

import CssSyntaxError from '../lib/css-syntax-error.js'

function isSyntaxError(e: unknown): e is CssSyntaxError {
  return e instanceof Error && e.name === 'CssSyntaxError'
}

let { bold, red, gray, yellow } = pico.createColors(true)

beforeEach(() => {
  jest.resetModules()
  jest.doMock('fs', () => ({}))
})

it('shows code with colors', () => {
  let postcss = require('../lib/postcss.js')

  let error: CssSyntaxError | undefined
  try {
    postcss.parse('a{')
  } catch (e) {
    if (isSyntaxError(e)) {
      error = e
    } else {
      throw e
    }
  }
  expect(error?.showSourceCode(true)).toEqual(
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

  let error: CssSyntaxError | undefined
  try {
    postcss.parse('a{')
  } catch (e) {
    if (isSyntaxError(e)) {
      error = e
    } else {
      throw e
    }
  }
  expect(error?.showSourceCode(false)).toEqual('> 1 | a{\n' + '    | ^')
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
