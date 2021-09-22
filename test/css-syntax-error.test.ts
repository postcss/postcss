import { red, bold, magenta, yellow, gray, cyan } from 'nanocolors'
import { join, resolve as pathResolve } from 'path'
import { pathToFileURL } from 'url'
import stripAnsi from 'strip-ansi'
import Concat from 'concat-with-sourcemaps'

import postcss, {
  ProcessOptions,
  CssSyntaxError,
  Plugin,
  Rule
} from '../lib/postcss.js'

function isSyntaxError(e: unknown): e is CssSyntaxError {
  return e instanceof Error && e.name === 'CssSyntaxError'
}

async function catchError(cb: () => Promise<any>): Promise<CssSyntaxError> {
  try {
    await cb()
  } catch (e) {
    if (isSyntaxError(e)) {
      return e
    } else {
      throw e
    }
  }
  throw new Error('Error was not thrown')
}

function parseError(
  css: string,
  opts?: Pick<ProcessOptions, 'map' | 'from'>
): CssSyntaxError {
  try {
    postcss.parse(css, opts)
  } catch (e) {
    if (isSyntaxError(e)) {
      return e
    } else {
      throw e
    }
  }
  throw new Error('Error was not thrown')
}

it('saves source', () => {
  let error = parseError('a {\n  content: "\n}')

  expect(error instanceof CssSyntaxError).toBe(true)
  expect(error.name).toEqual('CssSyntaxError')
  expect(error.message).toEqual('<css input>:2:12: Unclosed string')
  expect(error.reason).toEqual('Unclosed string')
  expect(error.line).toEqual(2)
  expect(error.column).toEqual(12)
  expect(error.source).toEqual('a {\n  content: "\n}')

  expect(error.input).toEqual({
    line: error.line,
    column: error.column,
    source: error.source
  })
})

it('has stack trace', () => {
  expect(parseError('a {\n  content: "\n}').stack).toMatch(
    /css-syntax-error\.test\.ts/
  )
})

it('highlights broken line with colors', () => {
  expect(parseError('#a .b c() {').showSourceCode(true)).toEqual(
    bold(red('>')) +
      gray(' 1 | ') +
      magenta('#a') +
      ' ' +
      yellow('.b') +
      ' ' +
      cyan('c') +
      cyan('()') +
      ' ' +
      yellow('{') +
      '\n ' +
      gray('   | ') +
      bold(red('^'))
  )
})

it('highlights broken line', () => {
  expect(parseError('a {\n  content: "\n}').showSourceCode(false)).toEqual(
    '  1 | a {\n' + '> 2 |   content: "\n' + '    |            ^\n' + '  3 | }'
  )
})

it('highlights broken line, when indented with tabs', () => {
  expect(
    parseError('a {\n\t \t  content:\t"\n}').showSourceCode(false)
  ).toEqual(
    '  1 | a {\n' +
      '> 2 | \t \t  content:\t"\n' +
      '    | \t \t          \t^\n' +
      '  3 | }'
  )
})

it('highlights small code example', () => {
  expect(parseError('a {').showSourceCode(false)).toEqual(
    '> 1 | a {\n' + '    | ^'
  )
})

it('add leading space for line numbers', () => {
  let css = '\n\n\n\n\n\n\na {\n  content: "\n}\n\n\n'
  expect(parseError(css).showSourceCode(false)).toEqual(
    '   7 | \n' +
      '   8 | a {\n' +
      '>  9 |   content: "\n' +
      '     |            ^\n' +
      '  10 | }\n' +
      '  11 | '
  )
})

it('prints with highlight', () => {
  expect(stripAnsi(parseError('a {').toString())).toEqual(
    'CssSyntaxError: <css input>:1:1: Unclosed block\n' +
      '\n' +
      '> 1 | a {\n' +
      '    | ^\n'
  )
})

it('misses highlights without source content', () => {
  let error = parseError('a {')
  error.source = undefined
  expect(error.toString()).toEqual(
    'CssSyntaxError: <css input>:1:1: Unclosed block'
  )
})

it('misses position without source', () => {
  let decl = postcss.decl({ prop: 'color', value: 'black' })
  let error = decl.error('Test')
  expect(error.toString()).toEqual('CssSyntaxError: <css input>: Test')
})

it('uses source map', () => {
  function urlOf(file: string): string {
    return pathToFileURL(join(__dirname, file)).toString()
  }

  let concat = new Concat(true, join(__dirname, 'build', 'all.css'))
  concat.add(urlOf('a.css'), 'a { }\n')
  concat.add(urlOf('b.css'), '\nb {\n')

  let error = parseError(concat.content.toString(), {
    from: join(__dirname, 'build', 'all.css'),
    map: { prev: concat.sourceMap }
  })

  expect(error.file).toEqual(join(__dirname, 'b.css'))
  expect(error.line).toEqual(2)
  expect(error.source).not.toBeDefined()

  expect(error.input).toEqual({
    url: urlOf(join('build', 'all.css')),
    file: join(__dirname, 'build', 'all.css'),
    line: 3,
    column: 1,
    source: 'a { }\n\nb {\n'
  })
})

it('works with path in sources', () => {
  function pathOf(file: string): string {
    return join(__dirname, file)
  }

  let concat = new Concat(true, join(__dirname, 'build', 'all.css'))
  concat.add(pathOf('a.css'), 'a { }\n')
  concat.add(pathOf('b.css'), '\nb {\n')

  let error = parseError(concat.content.toString(), {
    from: join(__dirname, 'build', 'all.css'),
    map: { prev: concat.sourceMap }
  })

  expect(error.file).toEqual(join(__dirname, 'b.css'))
  expect(error.line).toEqual(2)
  expect(error.source).not.toBeDefined()

  expect(error.input).toEqual({
    url: pathToFileURL(pathOf(join('build', 'all.css'))).toString(),
    file: join(__dirname, 'build', 'all.css'),
    line: 3,
    column: 1,
    source: 'a { }\n\nb {\n'
  })
})

it('shows origin source', () => {
  let input = postcss([() => {}]).process('a{}', {
    from: '/a.css',
    to: '/b.css',
    map: { inline: false }
  })
  let error = parseError('a{', {
    from: '/b.css',
    map: { prev: input.map }
  })
  expect(error.source).toEqual('a{}')
})

it('does not uses wrong source map', () => {
  let error = parseError('a { }\nb {', {
    from: 'build/all.css',
    map: {
      prev: {
        version: 3,
        file: 'build/all.css',
        sources: ['a.css', 'b.css'],
        mappings: 'A'
      }
    }
  })
  expect(error.file).toEqual(pathResolve('build/all.css'))
})

it('set source plugin', () => {
  let a = postcss.parse('a{}').first as Rule
  let error = a.error('Error', { plugin: 'PL' })
  expect(error.plugin).toEqual('PL')
  expect(error.toString()).toMatch(
    /^CssSyntaxError: PL: <css input>:1:1: Error/
  )
})

it('set source plugin automatically', async () => {
  let plugin: Plugin = {
    postcssPlugin: 'test-plugin',
    Once(css) {
      if (css.first) {
        throw css.first.error('Error')
      }
    }
  }

  let error = await catchError(() =>
    postcss([plugin]).process('a{}', { from: undefined })
  )
  expect(error.plugin).toEqual('test-plugin')
  expect(error.toString()).toMatch(/test-plugin/)
})

it('set plugin automatically in async', async () => {
  let plugin: Plugin = {
    postcssPlugin: 'async-plugin',
    Once(css) {
      return new Promise((resolve, reject) => {
        if (css.first) {
          reject(css.first.error('Error'))
        }
      })
    }
  }

  let error = await catchError(() =>
    postcss([plugin]).process('a{}', { from: undefined })
  )
  expect(error.plugin).toEqual('async-plugin')
})
