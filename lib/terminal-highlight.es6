import chalk from 'chalk';

import tokenize from './tokenize';
import Input    from './input';

let colors = new chalk.constructor({ enabled: true });

const HIGHLIGHT_THEME = {
    'brackets': colors.cyan,
    'at-word':  colors.cyan,
    'comment':  colors.gray,
    'string':   colors.green,
    '{':        colors.yellow,
    '}':        colors.yellow,
    '[':        colors.yellow,
    ']':        colors.yellow,
    ':':        colors.yellow,
    ';':        colors.yellow
};

function terminalHighlight(css) {
    let tokens = tokenize(new Input(css), { ignoreErrors: true });
    let result = [];
    for ( let token of tokens ) {
        let color = HIGHLIGHT_THEME[token[0]];
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
