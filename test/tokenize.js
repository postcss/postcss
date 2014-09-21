var tokenize = require('../lib/tokenize');

describe('tokenize', () => {

    it('tokenizes empty string', () => {
        tokenize('').should.eql([]);
    });

    it('tokenizes space', () => {
        tokenize('\n ').should.eql([ ['space', '\n '] ]);
    });

    it('tokenizes word', () => {
        tokenize('ab').should.eql([
            ['word', 'ab', { column: 1, line: 1 }, { column: 2, line: 1 }]
        ]);
    });

    it('splits word by !', () => {
        tokenize('aa!bb').should.eql([
            ['word', 'aa',  { column: 1, line: 1 }, { column: 2, line: 1 }],
            ['word', '!bb', { column: 3, line: 1 }, { column: 5, line: 1 }],
        ]);
    });

    it('tokenizes CSS', () => {
        css = 'a {\n' +
              '  content: "a";\n' +
              '  width: calc(1px;)\n' +
              '  }\n' +
              '/* small screen */\n' +
              '@media screen {}';
        tokenize(css).should.eql([
            ['word', 'a', { column: 1, line: 1 }, { column: 1, line: 1 } ],
            ['space', ' '],
            ['{', '{', { column: 3, line: 1 }],
            ['space', '\n  '],
            ['word', 'content', { column: 3, line: 2 }, { column: 9, line: 2 }],
            [':', ':'],
            ['space', ' '],
            ['string', '"a"', { column: 12, line: 2 }, { column: 14, line: 2 }],
            [';', ';', { column: 15, line: 2 }],
            ['space', '\n  '],
            ['word', 'width', { column: 3, line: 3 }, { column: 7, line: 3 }],
            [':', ':'],
            ['space', ' '],
            ['word', 'calc', { column: 10, line: 3 }, { column: 13, line: 3 }],
            ['brackets', '(1px;)', { column: 14, line: 3 },
                                   { column: 19, line: 3 }],
            ['space', '\n  '],
            ['}', '}', { column: 3, line: 4 }],
            ['space', '\n'],
            ['comment', '/* small screen */', { column: 1, line: 5 },
                                              { column: 18, line: 5 }],
            ['space', '\n'],
            ['at-word', '@media', { column: 1, line: 6 }],
            ['space', ' '],
            ['word', 'screen', { column: 8, line: 6 }, { column: 13, line: 6 }],
            ['space', ' '],
            ['{', '{', { column: 15, line: 6 }],
            ['}', '}', { column: 16, line: 6 }]
        ]);
    });

    it('shows file name in errors', () => {
        ( () => tokenize(' "', { from: 'a.css' }) ).should.throw(/^a.css/);
    });

    it('throws error on unclosed string', () => {
        ( () => tokenize(' "') ).should.throw(/:1:2: Unclosed quote/);
    });

    it('fixes unclosed string in safe smode', () => {
        tokenize('"', { safe: true }).should.eql([
            ['string', '""', { column: 1, line: 1 }, { column: 1, line: 1 }]
        ]);
    });

    it('throws error on unclosed comment', () => {
        ( () => tokenize(' /*') ).should.throw(/:1:2: Unclosed comment/);
    });

    it('fixes unclosed comment in safe smode', () => {
        tokenize('/*', { safe: true }).should.eql([
            ['comment', '/**/', { column: 1, line: 1 }, { column: 2, line: 1 }]
        ]);
    });

});
