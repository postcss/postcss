import chalk from 'chalk'

import tokenizer from './tokenize'
import Input from './input'
import * as tokenCodes from './token-codes'

const HIGHLIGHT_THEME = {
  [tokenCodes.BRACKETS]: chalk.cyan,
  [tokenCodes.AT]: chalk.cyan,
  [tokenCodes.COMMENT]: chalk.gray,
  [tokenCodes.STRING]: chalk.green,
  [tokenCodes.CLASS]: chalk.yellow,
  [tokenCodes.CALL]: chalk.cyan,
  [tokenCodes.HASH]: chalk.magenta,
  [tokenCodes.OPEN_PARENTHESES]: chalk.cyan,
  [tokenCodes.CLOSE_PARENTHESES]: chalk.cyan,
  [tokenCodes.OPEN_CURLY]: chalk.yellow,
  [tokenCodes.CLOSE_CURLY]: chalk.yellow,
  [tokenCodes.OPEN_SQUARE]: chalk.yellow,
  [tokenCodes.CLOSE_SQUARE]: chalk.yellow,
  [tokenCodes.COLON]: chalk.yellow,
  [tokenCodes.SEMICOLON]: chalk.yellow
}

// function getTokenContent(token) {
//   return this.input.css.slice(token[1], token[2])
// }

function getTokenType ([type], content, processor) {
  if (type === tokenCodes.WORD) {
    if (content[0] === '.') {
      return tokenCodes.CLASS
    }
    if (content[0] === '#') {
      return tokenCodes.HASH
    }
  }

  if (!processor.endOfFile()) {
    const next = processor.nextToken()
    processor.back(next)
    if (
      next[0] === tokenCodes.BRACKETS || 
      next[0] === tokenCodes.OPEN_PARENTHESES
    ) {
      return tokenCodes.CALL
    }
  }

  return type
}

function terminalHighlight (css) {
  const processor = tokenizer(new Input(css), { ignoreErrors: true })
  let result = ''
  while (!processor.endOfFile()) {
    const token = processor.nextToken()
    const content = css.slice(token[1], token[2])
    const color = HIGHLIGHT_THEME[getTokenType(token, content, processor)]
    if (color) {
      result += content.split(/\r?\n/)
        .map(i => color(i))
        .join('\n')
    } else {
      result += content
    }
  }
  return result
}

export default terminalHighlight
