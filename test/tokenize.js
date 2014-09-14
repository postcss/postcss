var tokenize = require('../lib/tokenize');

describe('tokenize', () => {

    it('tokenizes empty string', () => {
        tokenize('').should.eql([]);
    });

    it('tokenizes space', () => {
        tokenize('  ').should.eql([ ['space', '  '] ]);
    });

    it('tokenizes spaces', () => {
        tokenize('  \n  ').should.eql([ ['space', '  \n'], ['space', '  '] ]);
    });

    it('tokenizes word', () => {
        tokenize('ab').should.eql([ ['word', 'ab', { column: 1, line: 1 }] ]);
    });

    it('tokenizes CSS', () => {
        css = 'a {\n' +
              '  content: "a";\n' +
              '  }\n' +
              '/* small screen */\n' +
              '@media screen {}';
        tokenize(css).should.eql([
            ['word', 'a', { column: 1, line: 1 } ],
            ['space', ' '],
            ['{', '{'],
            ['space', '\n'],
            ['space', '  '],
            ['word', 'content', { column: 3, line: 2 }],
            [':', ':'],
            ['space', ' '],
            ['string', '"a"'],
            [';', ';'],
            ['space', '\n'],
            ['space', '  '],
            ['}', '}', { column: 3, line: 3 }],
            ['space', '\n'],
            ['comment', '/* small screen */', { column: 1, line: 4 },
                                              { column: 18, line: 4 }],
            ['space', '\n'],
            ['at-word', '@media', { column: 1, line: 5 }],
            ['space', ' '],
            ['word', 'screen', { column: 8, line: 5 }],
            ['space', ' '],
            ['{', '{'],
            ['}', '}', { column: 16, line: 5 }]
        ]);
    });

    it('shows file name in errors', () => {
        ( () => tokenize(' "', { from: 'a.css' }) ).should.throw(/^a.css/);
    });

    it('throws error on unclosed string', () => {
        ( () => tokenize(' "') ).should.throw(/:1:2: Unclosed quote/);
    });

    it('fixes unclosed string in safe smode', () => {
        tokenize('"', { safe: true }).should.eql([ ['string', '""'] ]);
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
