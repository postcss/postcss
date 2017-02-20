import chalk from 'chalk';

import tokenizer from './tokenize';
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

function getTokenType([type, value], processor) {
    if ( type === 'word' ) {
        if ( value[0] === '.' ) {
            return 'class';
        }
        if ( value[0] === '#' ) {
            return 'hash';
        }
    }

    if ( !processor.endOfFile() ) {
        let next = processor.nextToken();
        processor.back(next);
        if ( next[0] === 'brackets' || next[0] === '(' ) return 'call';
    }

    return type;
}

function terminalHighlight(css) {
    let processor = tokenizer(new Input(css), { ignoreErrors: true });
    let result = '';
    while ( !processor.endOfFile() ) {
        let token = processor.nextToken();
        let color = HIGHLIGHT_THEME[getTokenType(token, processor)];
        if ( color ) {
            result += token[1].split(/\r?\n/)
              .map( i => color(i) )
              .join('\n');
        } else {
            result += token[1];
        }
    }
    return result;
}

export default terminalHighlight;
