'use strict'

let pico = require('picocolors')

let tokenizer = require('./tokenize')

let Input

function registerInput(dependant) {
  Input = dependant
}

const HIGHLIGHT_THEME = {
  'brackets': pico.cyan,
  'at-keyword-token': pico.cyan,
  'comment': pico.gray,
  'string-token': pico.green,
  'bad-string-token': pico.green,
  'ident-token': pico.yellow,
  'hash-token': pico.magenta,
  'function-token': pico.cyan,
  'url-token': pico.cyan,
  'bad-url-token': pico.cyan,
  '(-token': pico.cyan,
  ')-token': pico.cyan,
  '{-token': pico.yellow,
  '}-token': pico.yellow,
  '[-token': pico.yellow,
  ']-token': pico.yellow,
  'colon-token': pico.yellow,
  'semicolon-token': pico.yellow,
  'delim-token': pico.yellow
}

function terminalHighlight(css) {
  let processor = tokenizer(new Input(css), { ignoreErrors: true })
  let result = ''
  while (!processor.endOfFile()) {
    let token = processor.nextToken()
    let color = HIGHLIGHT_THEME[token[0]]
    if (color) {
      result += token[1]
        .split(/\r?\n/)
        .map(i => color(i))
        .join('\n')
    } else {
      result += token[1]
    }
  }
  return result
}

terminalHighlight.registerInput = registerInput

module.exports = terminalHighlight
