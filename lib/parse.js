import safeParse from 'postcss-safe-parser';

import warnOnce from './warn-once';
import Parser   from './parser';
import Input    from './input';

export default function parse(css, opts) {
    if ( opts && opts.safe ) {
        warnOnce('Option safe is deprecated. ' +
                 'Use parser: require("postcss-safe-parser")');
        return safeParse(css, opts);
    }

    let input = new Input(css, opts);

    let parser = new Parser(input);
    parser.tokenize();
    parser.loop();

    return parser.root;
}
