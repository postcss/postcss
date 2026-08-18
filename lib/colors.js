'use strict'

let { styleText } = require('util')

// node:util has no isColorSupported, so repeat picocolors' detection here
let isColorSupported =
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
  return text => styleText(formats, String(text), { validateStream: false })
}

module.exports = { createColor, isColorSupported }
