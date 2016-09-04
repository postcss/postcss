import tokenize from './tokenize';
import Input    from './input';

// 5	+	const HIGHLIGHT_THEME = {
// 6	+	  'space':    null,
// 7	+	  'brackets': chalk.cyan,
// 8	+	  'string':   chalk.red,
// 9	+	  'word':     chalk.cyan,
// 10	+	  'at-word':  chalk.red,
// 11	+	  'comment':  chalk.grey,
// 12	+	  '{':        chalk.green,
// 13	+	  '}':        chalk.green,
// 14	+	  ':':        chalk.bold,
// 15	+	  ';':        chalk.bold,
// 16	+	  '(':        chalk.blue.bold,
// 17	+	  ')':        chalk.blue.bold
// 18	+	};
// 19	+
// 20	+	export default function highlight(code) {
// 21	+	  let tokens = tokenize(new Input(code), { recover: true });
// 22	+	  let result = [];
// 23	+	  for (let i = 0; i < tokens.length; i++) {
// 24	+	    let [tok, value] = tokens[i];
// 25	+	    let colorize = HIGHLIGHT_THEME[tok];
// 26	+	    if (colorize) {
// 27	+	      result.push(colorize(value));
// 28	+	    } else {
// 29	+	      result.push(value);
// 30	+	    }
// 31	+	  }
// 32	+	  return result.join('');
// 33	+	}

const HIGHLIGHT_THEME = {
    'brackets': [36, 39], // cyan
    'string':   [31, 39], // red
    'at-word':  [31, 39], // red
    'comment':  [90, 39], // gray
    '{':        [32, 39], // green
    '}':        [32, 39], // green
    ':':        [ 1, 22], // bold
    ';':        [ 1, 22], // bold
    '(':        [ 1, 22], // bold
    ')':        [ 1, 22]  // bold
};

function code(color) {
    return '\u001b[' + color + 'm';
}

function terminalHighlight(css) {
    let tokens = tokenize(new Input(css), { ignoreErrors: true });
    let result = [];
    for ( let token of tokens ) {
        let color = HIGHLIGHT_THEME[token[0]];
        if ( color ) {
            result.push(token[1].split(/\r?\n/)
              .map( i => code(color[0]) + i + code(color[1]) )
              .join('\n'));
        } else {
            result.push(token[1]);
        }
    }
    return result.join('');
}

export default terminalHighlight;
