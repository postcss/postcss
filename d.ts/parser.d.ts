import Input from './input';
import Root from './root';
export default class Parser {
    input: Input;
    pos: number;
    root: Root;
    spaces: string;
    semicolon: boolean;
    private current;
    private tokens;
    constructor(input: Input);
    tokenize(): void;
    loop(): void;
    private comment(token);
    private emptyRule(token);
    private word();
    private rule(tokens);
    private decl(tokens);
    private atrule(token);
    private end(token);
    private endFile();
    private unknownWord(decl, token);
    private checkMissedSemicolon(tokens);
    private init(node, line?, column?);
    private raw(node, prop, tokens);
    private spacesFromEnd(tokens);
    private spacesFromStart(tokens);
    private stringFrom(tokens, from);
}
