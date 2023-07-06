import Concat from 'concat-with-sourcemaps'
import { join, resolve as pathResolve } from 'path'
import * as pico from 'picocolors'
import stripAnsi = require('strip-ansi')
import { pathToFileURL } from 'url'
import { test } from 'uvu'
import { equal, is, match, type } from 'uvu/assert'

import postcss, {
  CssSyntaxError,
  Plugin,
  ProcessOptions,
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
  opts?: Pick<ProcessOptions, 'from' | 'map'>
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

test('saves source', () => {
  let error = parseError('a {\n  content: "\n}')

  is(error instanceof CssSyntaxError, true)
  is(error.name, 'CssSyntaxError')
  is(error.message, '<css input>:2:12: Unclosed string')
  is(error.reason, 'Unclosed string')
  is(error.line, 2)
  is(error.column, 12)
  is(error.source, 'a {\n  content: "\n}')

  equal(error.input, {
    column: error.column,
    endColumn: error.endColumn,
    endLine: error.endLine,
    line: error.line,
    source: error.source,
  })
})

test('saves source with ranges', () => {
  let error = parseError('badword')

  is(error instanceof CssSyntaxError, true)
  is(error.name, 'CssSyntaxError')
  is(error.message, '<css input>:1:1: Unknown word')
  is(error.reason, 'Unknown word')
  is(error.line, 1)
  is(error.column, 1)
  is(error.endLine, 1)
  is(error.endColumn, 8)
  is(error.source, 'badword')

  equal(error.input, {
    column: error.column,
    endColumn: error.endColumn,
    endLine: error.endLine,
    line: error.line,
    source: error.source
  })
})

test('has stack trace', () => {
  match(parseError('a {\n  content: "\n}').stack,
    /css-syntax-error\.test\.ts/
  )
})

test('saves source with ranges', () => {
  let error = parseError('badword')

 is(error instanceof CssSyntaxError, true)
 is(error.name, 'CssSyntaxError')
 is(error.message, '<css input>:1:1: Unknown word')
 is(error.reason, 'Unknown word')
 is(error.line, 1)
 is(error.column, 1)
 is(error.endLine, 1)
 is(error.endColumn, 8)
 is(error.source, 'badword')

 equal(error.input, {
    column: error.column,
    endColumn: error.endColumn,
    endLine: error.endLine,
    line: error.line,
    source: error.source
  })
})

test('saves source with ranges', () => {
  let error = parseError('badword')

 is(error instanceof CssSyntaxError, true)
 is(error.name, 'CssSyntaxError')
 is(error.message, '<css input>:1:1: Unknown word')
 is(error.reason, 'Unknown word')
 is(error.line, 1)
 is(error.column, 1)
 is(error.endLine, 1)
 is(error.endColumn, 8)
 is(error.source, 'badword')

 equal(error.input, {
    column: error.column,
    endColumn: error.endColumn,
    endLine: error.endLine,
    line: error.line,
    source: error.source
  })
})

test('highlights broken line with colors', () => {
  is(
    parseError('#a .b c() {').showSourceCode(true),
    pico.bold(pico.red('>')) +
      pico.gray(' 1 | ') +
      pico.magenta('#a') +
      ' ' +
      pico.yellow('.b') +
      ' ' +
      pico.cyan('c') +
      pico.cyan('()') +
      ' ' +
      pico.yellow('{') +
      '\n ' +
      pico.gray('   | ') +
      pico.bold(pico.red('^'))
  )
})

test('highlights broken line', () => {
  is(
    parseError('a {\n  content: "\n}').showSourceCode(false),
    '  1 | a {\n' + '> 2 |   content: "\n' + '    |            ^\n' + '  3 | }'
  )
})

test('highlights broken line, when indented with tabs', () => {
  is(
    parseError('a {\n\t \t  content:\t"\n}').showSourceCode(false),
    '  1 | a {\n' +
      '> 2 | \t \t  content:\t"\n' +
      '    | \t \t          \t^\n' +
      '  3 | }'
  )
})

test('highlights small code example', () => {
  is(parseError('a {').showSourceCode(false), '> 1 | a {\n' + '    | ^')
})

test('add leading space for line numbers', () => {
  let css = '\n\n\n\n\n\n\na {\n  content: "\n}\n\n\n'
  is(
    parseError(css).showSourceCode(false),
    '   7 | \n' +
      '   8 | a {\n' +
      '>  9 |   content: "\n' +
      '     |            ^\n' +
      '  10 | }\n' +
      '  11 | '
  )
})

test('prints with highlight', () => {
  is(
    stripAnsi(parseError('a {').toString()),
    'CssSyntaxError: <css input>:1:1: Unclosed block\n' +
      '\n' +
      '> 1 | a {\n' +
      '    | ^\n'
  )
})

test('misses highlights without source content', () => {
  let error = parseError('a {')
  error.source = undefined
  is(error.toString(), 'CssSyntaxError: <css input>:1:1: Unclosed block')
})

test('misses position without source', () => {
  let decl = postcss.decl({ prop: 'color', value: 'black' })
  let error = decl.error('Test')
  is(error.toString(), 'CssSyntaxError: <css input>: Test')
})

test('uses source map', () => {
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

  is(error.file, join(__dirname, 'b.css'))
  is(error.line, 2)
  type(error.source, 'undefined')

  equal(error.input, {
    column: 1,
    endColumn: error.endColumn,
    endLine: error.endLine,
    file: join(__dirname, 'build', 'all.css'),
    line: 3,
    source: 'a { }\n\nb {\n',
    url: urlOf(join('build', 'all.css')),
  })
})

test('works with path in sources', () => {
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

  is(error.file, join(__dirname, 'b.css'))
  is(error.line, 2)
  type(error.source, 'undefined')

  equal(error.input, {
    column: 1,
    endColumn: error.endColumn,
    endLine: error.endLine,
    file: join(__dirname, 'build', 'all.css'),
    line: 3,
    source: 'a { }\n\nb {\n',
    url: pathToFileURL(pathOf(join('build', 'all.css'))).toString(),
  })
})

test('shows origin source', () => {
  let input = postcss([() => {}]).process('a{}', {
    from: '/a.css',
    map: { inline: false },
    to: '/b.css'
  })
  let error = parseError('a{', {
    from: '/b.css',
    map: { prev: input.map }
  })
  is(error.source, 'a{}')
})

test('does not uses wrong source map', () => {
  let error = parseError('a { }\nb {', {
    from: 'build/all.css',
    map: {
      prev: {
        file: 'build/all.css',
        mappings: 'A',
        sources: ['a.css', 'b.css'],
        version: 3
      }
    }
  })
  is(error.file, pathResolve('build/all.css'))
})

test('set source plugin', () => {
  let a = postcss.parse('a{}').first as Rule
  let error = a.error('Error', { plugin: 'PL' })
  is(error.plugin, 'PL')
  match(error.toString(), /^CssSyntaxError: PL: <css input>:1:1: Error/)
})

test('set source plugin automatically', async () => {
  let plugin: Plugin = {
    Once(css) {
      if (css.first) {
        throw css.first.error('Error')
      }
    },
    postcssPlugin: 'test-plugin'
  }

  let error = await catchError(() =>
    postcss([plugin]).process('a{}', { from: undefined })
  )
  is(error.plugin, 'test-plugin')
  match(error.toString(), /test-plugin/)
})

test('set plugin automatically in async', async () => {
  let plugin: Plugin = {
    Once(css) {
      return new Promise((resolve, reject) => {
        if (css.first) {
          reject(css.first.error('Error'))
        }
      })
    },
    postcssPlugin: 'async-plugin'
  }

  let error = await catchError(() =>
    postcss([plugin]).process('a{}', { from: undefined })
  )
  is(error.plugin, 'async-plugin')
})

test.run()
