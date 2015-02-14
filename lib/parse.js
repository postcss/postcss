import Parser from './parser';
import Input  from './input';

export default function (css, opts) {
    var input = new Input(css, opts);

    var parser = new Parser(input);
    parser.tokenize();
    parser.loop();

    return parser.root;
};
