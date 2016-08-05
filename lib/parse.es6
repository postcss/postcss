import Parser from './parser';
import Input  from './input';

export default function parse(css, opts) {
    if ( opts && opts.safe ) {
        throw new Error('Option safe was removed. ' +
                        'Use parser: require("postcss-safe-parser")');
    }

    let input = new Input(css, opts);

    let parser = new Parser(input);
    try {
        parser.tokenize();
        parser.loop();
    } catch (e) {
        if ( e.name === 'CssSyntaxError' && opts && opts.from ) {
            if ( /\.scss$/i.test(opts.from) ) {
                e.message += '\nYou try to parse SCSS file with standard ' +
                             'CSS parser. Maybe you need change parser ' +
                             'to postcss-scss?';
            } else if ( /\.less$/i.test(opts.from) ) {
                e.message += '\nYou try to parse Less file with standard ' +
                             'CSS parser. Maybe you need change parser ' +
                             'to postcss-less?';
            }
        }
        throw e;
    }

    return parser.root;
}
