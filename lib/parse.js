import Parser from './parser';
import Input  from './input';

export default function parse(css, opts) {
    let input = new Input(css, opts);

    let parser = new Parser(input);
    parser.tokenize();
    parser.loop();

    return parser.root;
}
