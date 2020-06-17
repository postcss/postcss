let kleur = require('kleur/colors')

let tokenizer = require('./tokenize')

let Input

function registerInput (dependant) {
  Input = dependant
}

const HIGHLIGHT_THEME = {
  'brackets': kleur.cyan,
  'at-word': kleur.cyan,
  'comment': kleur.gray,
  'string': kleur.green,
  'class': kleur.yellow,
  'call': kleur.cyan,
  'hash': kleur.magenta,
  '(': kleur.cyan,
  ')': kleur.cyan,
  '{': kleur.yellow,
  '}': kleur.yellow,
  '[': kleur.yellow,
  ']': kleur.yellow,
  ':': kleur.yellow,
  ';': kleur.yellow
}

function getTokenType ([type, value], processor) {
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

function terminalHighlight (css) {
  let processor = tokenizer(new Input(css), { ignoreErrors: true })
  let result = ''
  while (!processor.endOfFile()) {
    let token = processor.nextToken()
    let color = HIGHLIGHT_THEME[getTokenType(token, processor)]
    if (color) {
      result += token[1].split(/\r?\n/)
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
