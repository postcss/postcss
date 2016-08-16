import chalk from 'chalk';
import tokenize from './tokenize';
import Input from './input';

const HIGHLIGHT_THEME = {
  'space':    null,
  'brackets': chalk.cyan,
  'string':   chalk.red,
  'word':     chalk.cyan,
  'at-word':  chalk.red,
  'comment':  chalk.grey,
  '{':        chalk.green,
  '}':        chalk.green,
  ':':        chalk.bold,
  ';':        chalk.bold,
  '(':        chalk.blue.bold,
  ')':        chalk.blue.bold
};

export default function highlight(code) {
  let tokens = tokenize(new Input(code), { recover: true });
  let result = [];
  for (let i = 0; i < tokens.length; i++) {
    let [tok, value] = tokens[i];
    let colorize = HIGHLIGHT_THEME[tok];
    if (colorize) {
      result.push(colorize(value));
    } else {
      result.push(value);
    }
  }
  return result.join('');
}
