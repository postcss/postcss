var tokenize = require('../lib/tokenize');
var Input    = require('../lib/input');

describe('tokenize', () => {

    it('tokenizes empty file', () => {
        tokenize(new Input('')).should.eql([]);
    });

    it('tokenizes space', () => {
        tokenize(new Input('\r\n \f\t')).should.eql([ ['space', '\r\n \f\t'] ]);
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

    it('changes lines in spaces', () => {
        tokenize(new Input('a \n b')).should.eql([
            ['word',  'a', 1, 1, 1, 1],
            ['space', ' \n '],
            ['word',  'b', 2, 2, 2, 2]
        ]);
    });

    it('tokenizes control chars', () => {
        tokenize(new Input('({:;})')).should.eql([
            ['(', '(', 1, 1],
            ['{', '{', 1, 2],
            [':', ':', 1, 3],
            [';', ';', 1, 4],
            ['}', '}', 1, 5],
            [')', ')', 1, 6],
        ]);
    });

    it('escapes control symbols', () => {
        tokenize(new Input('\\(\\{\\"\\@')).should.eql([
            ['word', '\\', 1, 1, 1, 1],
            ['word', '(',  1, 2, 1, 2],
            ['word', '\\', 1, 3, 1, 3],
            ['word', '{',  1, 4, 1, 4],
            ['word', '\\', 1, 5, 1, 5],
            ['word', '"',  1, 6, 1, 6],
            ['word', '\\', 1, 7, 1, 7],
            ['word', '@',  1, 8, 1, 8]
        ]);
    });

    it('escapes backslash', () => {
        tokenize(new Input('\\\\\\\\(')).should.eql([
            ['word', '\\\\\\\\', 1, 1, 1, 4],
            ['(',    '(',        1, 5]
        ]);
    });

    it('tokenizes brackets', () => {
        tokenize(new Input('(ab)')).should.eql([
            ['(',    '(',  1, 1],
            ['word', 'ab', 1, 2, 1, 3],
            [')',    ')',  1, 4],
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

    it('tokenizes at-word', () => {
        tokenize(new Input('@word ')).should.eql([
            ['at-word', '@word', 1, 1, 1, 5],
            ['space',   ' ']
        ]);
    });

    it('tokenizes at-word end', () => {
        tokenize(new Input('@one{@two(@three)@four""')).should.eql([
            ['at-word', '@one',   1,  1, 1,  4],
            ['{',       '{',      1,  5],
            ['at-word', '@two',   1,  6, 1,  9],
            ['(',       '(',      1, 10],
            ['at-word', '@three', 1, 11, 1, 16],
            [')',       ')',      1, 17],
            ['at-word', '@four',  1, 18, 1, 22],
            ['string',  '""',     1, 23, 1, 24]
        ]);
    });

    it('tokenizes at-symbol', () => {
        tokenize(new Input('@')).should.eql([
            ['at-word', '@', 1, 1, 1, 1]
        ]);
    });

    it('tokenizes comment', () => {
        tokenize(new Input('/* a\nb */')).should.eql([
            ['comment', '/* a\nb */', 1, 1, 2, 4]
        ]);
    });

    it('changes lines in comments', () => {
        tokenize(new Input('a/* \n */b')).should.eql([
            ['word',    'a',        1, 1, 1, 1],
            ['comment', '/* \n */', 1, 2, 2, 3],
            ['word',    'b',        2, 4, 2, 4]
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
            ['word',     'a',                  1,  1, 1,  1],
            ['space',    ' '],
            ['{',        '{',                  1,  3],
            ['space',    '\n  '],
            ['word',     'content',            2,  3, 2,  9],
            [':',        ':',                  2, 10],
            ['space',    ' '],
            ['string',   '"a"',                2, 12, 2, 14],
            [';',        ';',                  2, 15],
            ['space',    '\n  '],
            ['word',     'width',              3,  3, 3,  7],
            [':',        ':',                  3,  8],
            ['space',    ' '],
            ['word',     'calc',               3, 10, 3, 13],
            ['(',        '(',                  3, 14],
            ['word',     '1px',                3, 15, 3, 17],
            [';',        ';',                  3, 18],
            [')',        ')',                  3, 19],
            ['space',    '\n  '],
            ['}',        '}',                  4,  3],
            ['space',    '\n'],
            ['comment',  '/* small screen */', 5,  1, 5, 18],
            ['space',    '\n'],
            ['at-word',  '@media',             6,  1, 6,  6],
            ['space',    ' '],
            ['word',     'screen',             6,  8, 6, 13],
            ['space',    ' '],
            ['{',        '{',                  6, 15],
            ['}',        '}',                  6, 16]
        ]);
    });

    it('throws error on unclosed string', () => {
        ( () => tokenize(new Input(' "')) )
           .should.throw(/:1:2: Unclosed quote/);
    });

    it('fixes unclosed string in safe mode', () => {
        tokenize(new Input('"', { safe: true })).should.eql([
            ['string', '""', 1, 1, 1, 2]
        ]);
    });

    it('throws error on unclosed comment', () => {
        ( () => tokenize(new Input(' /*')) )
            .should.throw(/:1:2: Unclosed comment/);
    });

    it('fixes unclosed comment in safe mode', () => {
        tokenize(new Input('/*', { safe: true })).should.eql([
            ['comment', '/**/', 1, 1, 1, 4]
        ]);
    });

});
