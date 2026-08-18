'use strict'

let { styleText } = require('util')

// util.styleText() was added in Node.js 20.12, but it accepts an array
// of formats only since 20.13. Detect what we actually use.
let hasStyleText = typeof styleText === 'function'
if (hasStyleText) {
  try {
    styleText(['bold', 'red'], '', { validateStream: false })
    /* c8 ignore next 3 */
  } catch {
    hasStyleText = false
  }
}

// node:util has no isColorSupported, so repeat picocolors' detection here
let isColorSupported =
  hasStyleText &&
  !(process.env.NO_COLOR || process.argv.includes('--no-color')) &&
  Boolean(
    process.env.FORCE_COLOR ||
      process.argv.includes('--color') ||
      process.platform === 'win32' ||
      ((process.stdout || {}).isTTY && process.env.TERM !== 'dumb') ||
      process.env.CI
  )

// Node.js re-opens the parent style after the nested one only since 22.19
// and 24.5. To support older versions, styles should be combined
// in a single call like createColor('bold', 'red') instead of bold(red()).
function createColor(...formats) {
  /* c8 ignore next */
  if (!hasStyleText) return text => String(text)
  return text => styleText(formats, String(text), { validateStream: false })
}

module.exports = { createColor, isColorSupported }
