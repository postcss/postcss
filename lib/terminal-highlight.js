'use strict'

let { createColor, isColorSupported } = require('./colors')
let tokenizer = require('./tokenize')

// Like picocolors' top-level colors, these are no-ops without color support
let style = isColorSupported ? createColor : () => text => String(text)

let Input

function registerInput(dependant) {
  Input = dependant
}

const HIGHLIGHT_THEME = {
  ';': style('yellow'),
  ':': style('yellow'),
  '(': style('cyan'),
  ')': style('cyan'),
  '[': style('yellow'),
  ']': style('yellow'),
  '{': style('yellow'),
  '}': style('yellow'),
  'at-word': style('cyan'),
  'brackets': style('cyan'),
  'call': style('cyan'),
  'class': style('yellow'),
  'comment': style('gray'),
  'hash': style('magenta'),
  'string': style('green')
}

function getTokenType([type, value], processor) {
  if (type === 'word') {
    if (value[0] === '.') {
      return 'class'
    }
    if (value[0] === '#') {
      return 'hash'
    }
  }

  if (!processor.endOfFile()) {
    let next = processor.nextToken()
    processor.back(next)
    if (next[0] === 'brackets' || next[0] === '(') return 'call'
  }

  return type
}

function terminalHighlight(css) {
  let processor = tokenizer(new Input(css), { ignoreErrors: true })
  let result = ''
  while (!processor.endOfFile()) {
    let token = processor.nextToken()
    let color = HIGHLIGHT_THEME[getTokenType(token, processor)]
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
