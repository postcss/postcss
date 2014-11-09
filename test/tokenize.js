var tokenize = require('../lib/tokenize');
var Input    = require('../lib/input');

describe('tokenize', () => {

    it('tokenizes empty file', () => {
        tokenize(new Input('')).should.eql([]);
    });

    it('tokenizes space', () => {
        tokenize(new Input('\n ')).should.eql([ ['space', '\n '] ]);
    });

    it('tokenizes word', () => {
        tokenize(new Input('ab')).should.eql([
            ['word', 'ab', 1, 1, 1, 2]
        ]);
    });

    it('splits word by !', () => {
        tokenize(new Input('aa!bb')).should.eql([
            ['word', 'aa',  1, 1, 1, 2],
            ['word', '!bb', 1, 3, 1, 5]
        ]);
    });

    it('changes lines', () => {
        tokenize(new Input('a\nb')).should.eql([
            ['word',  'a', 1, 1, 1, 1],
            ['space', '\n'],
            ['word',  'b', 2, 1, 2, 1]
        ]);
    });

    it('tokenizes control chars', () => {
        tokenize(new Input('{:;}')).should.eql([
            ['{', '{', 1, 1],
            [':', ':', 1, 2],
            [';', ';', 1, 3],
            ['}', '}', 1, 4]
        ]);
    });

    it('tokenizes string', () => {
        tokenize(new Input('\'"\'"\\""')).should.eql([
            ['string', "'\"'",  1, 1, 1, 3],
            ['string', '"\\""', 1, 4, 1, 7]
        ]);
    });

    it('tokenizes escaped string', () => {
        tokenize(new Input('"\\\\"')).should.eql([
            ['string', '"\\\\"', 1, 1, 1, 4]
        ]);
    });

    it('tokenizes brackets', () => {
        tokenize(new Input('("\n\\)")')).should.eql([
            ['brackets', '("\n\\)")', 1, 1, 2, 4]
        ]);
    });

    it('tokenizes escaped brackets', () => {
        tokenize(new Input('(\\\\)')).should.eql([
            ['brackets', '(\\\\)', 1, 1, 1, 4]
        ]);
    });

    it('tokenizes comment', () => {
        tokenize(new Input('/* a\nb */')).should.eql([
            ['comment', '/* a\nb */', 1, 1, 2, 4]
        ]);
    });

    it('tokenizes CSS', () => {
        var css = 'a {\n' +
              '  content: "a";\n' +
              '  width: calc(1px;)\n' +
              '  }\n' +
              '/* small screen */\n' +
              '@media screen {}';
        tokenize(new Input(css)).should.eql([
            ['word', 'a', 1, 1, 1, 1],
            ['space', ' '],
            ['{', '{', 1, 3],
            ['space', '\n  '],
            ['word', 'content', 2, 3, 2, 9],
            [':', ':', 2, 10],
            ['space', ' '],
            ['string', '"a"', 2, 12, 2, 14],
            [';', ';', 2, 15],
            ['space', '\n  '],
            ['word', 'width', 3, 3, 3, 7],
            [':', ':', 3, 8],
            ['space', ' '],
            ['word', 'calc', 3, 10, 3, 13],
            ['brackets', '(1px;)', 3, 14, 3, 19],
            ['space', '\n  '],
            ['}', '}', 4, 3],
            ['space', '\n'],
            ['comment', '/* small screen */', 5, 1, 5, 18],
            ['space', '\n'],
            ['at-word', '@media', 6, 1, 6, 6],
            ['space', ' '],
            ['word', 'screen', 6, 8, 6, 13],
            ['space', ' '],
            ['{', '{', 6, 15],
            ['}', '}', 6, 16]
        ]);
    });

    it('throws error on unclosed string', () => {
        ( () => tokenize(new Input(' "')) )
            .should.throw(/:1:2: Unclosed quote/);
    });

    it('fixes unclosed string in safe smode', () => {
        tokenize(new Input('"', { safe: true })).should.eql([
            ['string', '""', 1, 1, 1, 1]
        ]);
    });

    it('throws error on unclosed comment', () => {
        ( () => tokenize(new Input(' /*')) )
            .should.throw(/:1:2: Unclosed comment/);
    });

    it('fixes unclosed comment in safe smode', () => {
        tokenize(new Input('/*', { safe: true })).should.eql([
            ['comment', '/**/', 1, 1, 1, 2]
        ]);
    });

});
