import chalk from 'chalk';

import tokenize from './tokenize';
import Input    from './input';

let colors = new chalk.constructor({ enabled: true });

const HIGHLIGHT_THEME = {
    'brackets': colors.cyan,
    'invalid':  colors.white.bgRed.bold,
    'at-word':  colors.red,
    'comment':  colors.gray,
    'string':   colors.red,
    '{':        colors.green,
    '}':        colors.green,
    ':':        colors.bold,
    ';':        colors.bold,
    '(':        colors.bold,
    ')':        colors.bold
};

function inside(token, line, column) {
    if ( !line || !column ) {
        return false;
    } else if ( token.length >= 6 ) {
        return token[2] <= line && token[3] <= column &&
               token[4] >= line && token[5] >= column;
    } else if ( token.length === 4 ) {
        return token[2] === line && token[3] === column;
    } else {
        return false;
    }
}

function terminalHighlight(css, line, column) {
    let tokens = tokenize(new Input(css), { ignoreErrors: true });
    let result = [];
    for ( let token of tokens ) {
        let color = HIGHLIGHT_THEME[token[0]];
        if ( inside(token, line, column) ) {
            color = HIGHLIGHT_THEME.invalid;
        } else {
            color = HIGHLIGHT_THEME[token[0]];
        }
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
