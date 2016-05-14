import Parser from './parser';
import Input  from './input';

export default function parse(css, opts) {
    if ( opts && opts.safe ) {
        throw new Error('Option safe was removed. ' +
                 'Use parser: require("postcss-safe-parser")');
    }

    let input = new Input(css, opts);

    let parser = new Parser(input);
    parser.tokenize();
    parser.loop();

    return parser.root;
}
