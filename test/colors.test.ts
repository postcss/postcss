import { join } from 'node:path'
import * as nodeUtil from 'node:util'
import { test } from 'uvu'
import { is } from 'uvu/assert'

import { createColor } from '../lib/colors.js'

interface Colors {
  createColor(...formats: string[]): (text: string) => string
  isColorSupported: boolean
}

let util: any = nodeUtil
let colorsPath = join(__dirname, '..', 'lib', 'colors.js')
let hasStyleText = typeof util.styleText === 'function'

function withEnv<T>(
  env: NodeJS.ProcessEnv,
  argv: string[],
  isTTY: boolean,
  cb: () => T
): T {
  let oldEnv = process.env
  let oldArgv = process.argv
  let oldTTY = process.stdout.isTTY
  process.env = env
  process.argv = ['node', 'colors.test.ts', ...argv]
  process.stdout.isTTY = isTTY
  try {
    return cb()
  } finally {
    process.env = oldEnv
    process.argv = oldArgv
    process.stdout.isTTY = oldTTY
  }
}

function load(env: NodeJS.ProcessEnv, argv: string[] = [], isTTY = false): Colors {
  return withEnv(env, argv, isTTY, () => {
    delete require.cache[colorsPath]
    try {
      return require(colorsPath)
    } finally {
      delete require.cache[colorsPath]
    }
  })
}

test('combines formats in a single call', () => {
  if (!hasStyleText) return
  is(createColor('bold', 'red')('x'), '\x1b[1m\x1b[31mx\x1b[39m\x1b[22m')
  is(createColor('gray')('y'), '\x1b[90my\x1b[39m')
  is(createColor('yellow')('z'), '\x1b[33mz\x1b[39m')
})

test('forces colors when they are not supported', () => {
  if (!hasStyleText) return
  let colors = load({})
  is(colors.isColorSupported, process.platform === 'win32')
  is(
    withEnv({}, [], false, () => colors.createColor('red')('x')),
    '\x1b[31mx\x1b[39m'
  )
})

test('colors non-string values', () => {
  if (!hasStyleText) return
  is(createColor('red')(1 as unknown as string), '\x1b[31m1\x1b[39m')
})

test('enables colors by FORCE_COLOR', () => {
  is(load({ FORCE_COLOR: '1' }).isColorSupported, hasStyleText)
})

test('enables colors by --color', () => {
  is(load({}, ['--color']).isColorSupported, hasStyleText)
})

test('enables colors on CI', () => {
  is(load({ CI: 'true' }).isColorSupported, hasStyleText)
})

test('enables colors on TTY', () => {
  is(load({ TERM: 'xterm' }, [], true).isColorSupported, hasStyleText)
})

test('disables colors by NO_COLOR', () => {
  is(load({ FORCE_COLOR: '1', NO_COLOR: '1' }).isColorSupported, false)
})

test('disables colors by --no-color', () => {
  is(load({ FORCE_COLOR: '1' }, ['--no-color']).isColorSupported, false)
})

// Windows is always treated as color-capable, like in picocolors
if (process.platform !== 'win32') {
  test('disables colors without TTY', () => {
    is(load({ TERM: 'xterm' }, [], false).isColorSupported, false)
  })

  test('disables colors on dumb terminal', () => {
    is(load({ TERM: 'dumb' }, [], true).isColorSupported, false)
  })
}

test('degrades to plain text without util.styleText', () => {
  let styleText = util.styleText
  delete util.styleText
  try {
    let colors = load({ FORCE_COLOR: '1' })
    is(colors.isColorSupported, false)
    is(colors.createColor('bold', 'red')('x'), 'x')
  } finally {
    util.styleText = styleText
  }
})

test.run()
