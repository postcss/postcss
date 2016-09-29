import chalk from 'chalk';

import tokenize from './tokenize';
import Input    from './input';

let colors = new chalk.constructor({ enabled: true });

const HIGHLIGHT_THEME = {
    'brackets': colors.cyan,
    'at-word':  colors.cyan,
    'call':     colors.cyan,
    'comment':  colors.gray,
    'string':   colors.green,
    'class':    colors.yellow,
    'hash':     colors.magenta,
    '(':        colors.cyan,
    ')':        colors.cyan,
    '{':        colors.yellow,
    '}':        colors.yellow,
    '[':        colors.yellow,
    ']':        colors.yellow,
    ':':        colors.yellow,
    ';':        colors.yellow
};

function getTokenType([type, value], index, tokens) {
    if (type === 'word') {
        if (value[0] === '.') {
            return 'class';
        }
        if (value[0] === '#') {
            return 'hash';
        }
    }

    let nextToken = tokens[index + 1];
    if (nextToken && (nextToken[0] === 'brackets' || nextToken[0] === '(')) {
        return 'call';
    }

    return type;
}

function terminalHighlight(css) {
    let tokens = tokenize(new Input(css), { ignoreErrors: true });
    return tokens.map((token, index) => {
        let color = HIGHLIGHT_THEME[getTokenType(token, index, tokens)];
        if ( color ) {
            return token[1].split(/\r?\n/)
              .map( i => color(i) )
              .join('\n');
        } else {
            return token[1];
        }
    }).join('');
}

export default terminalHighlight;
