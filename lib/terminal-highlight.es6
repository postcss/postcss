import chalk from 'chalk';

import tokenize from './tokenize';
import Input    from './input';

let colors = new chalk.constructor({ enabled: true });

const HIGHLIGHT_THEME = {
    'brackets': colors.cyan,
    'at-word':  colors.cyan,
    'comment':  colors.gray,
    'string':   colors.green,
    'class':    colors.yellow,
    'hash':     colors.magenta,
    '{':        colors.yellow,
    '}':        colors.yellow,
    '[':        colors.yellow,
    ']':        colors.yellow,
    ':':        colors.yellow,
    ';':        colors.yellow
};

function getTokenType([type, value]) {
    if (type === 'word') {
        if (value[0] === '.') {
            return 'class';
        }
        if (value[0] === '#') {
            return 'hash';
        }
    }
    return type;
}

function terminalHighlight(css) {
    let tokens = tokenize(new Input(css), { ignoreErrors: true });
    let result = [];
    for ( let token of tokens ) {
        let color = HIGHLIGHT_THEME[getTokenType(token)];
        if ( color ) {
            result.push(token[1].split(/\r?\n/)
              .map( i => color(i) )
              .join('\n'));
        } else {
            result.push(token[1]);
        }
    }
    return result.join('');
}

export default terminalHighlight;
