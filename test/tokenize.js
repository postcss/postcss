import tokenize from '../lib/tokenize';
import Input    from '../lib/input';

import { expect } from 'chai';

let test = (css, opts, tokens) => {
    if ( typeof tokens === 'undefined' ) [tokens, opts] = [opts, tokens];
    expect(tokenize(new Input(css, opts))).to.eql(tokens);
};

describe('tokenize', () => {

    it('tokenizes empty file', () => {
        test('', []);
    });

    it('tokenizes space', () => {
        test('\r\n \f\t', [ ['space', '\r\n \f\t'] ]);
    });

    it('tokenizes word', () => {
        test('ab', [ ['word', 'ab', 1, 1, 1, 2] ]);
    });

    it('splits word by !', () => {
        test('aa!bb', [
            ['word', 'aa',  1, 1, 1, 2],
            ['word', '!bb', 1, 3, 1, 5]
        ]);
    });

    it('changes lines in spaces', () => {
        test('a \n b', [
            ['word',  'a', 1, 1, 1, 1],
            ['space', ' \n '],
            ['word',  'b', 2, 2, 2, 2]
        ]);
    });

    it('tokenizes control chars', () => {
        test('{:;}', [
            ['{', '{', 1, 1],
            [':', ':', 1, 2],
            [';', ';', 1, 3],
            ['}', '}', 1, 4]
        ]);
    });

    it('escapes control symbols', () => {
        test('\\(\\{\\"\\@', [
            ['word', '\\(', 1, 1, 1, 2],
            ['word', '\\{', 1, 3, 1, 4],
            ['word', '\\"', 1, 5, 1, 6],
            ['word', '\\@', 1, 7, 1, 8]
        ]);
    });

    it('escapes backslash', () => {
        test('\\\\\\\\{', [
            ['word', '\\\\\\\\', 1, 1, 1, 4],
            ['{',    '{',        1, 5]
        ]);
    });

    it('tokenizes simple brackets', () => {
        test('(ab)', [ ['brackets', '(ab)', 1, 1, 1, 4] ]);
    });

    it('tokenizes complicated brackets', () => {
        test('(())("")(/**/)(\\\\)(\n)(', [
            ['(',        '(',    1, 1],
            ['brackets', '()',   1, 2, 1, 3],
            [')',        ')',    1, 4],
            ['(',        '(',    1, 5],
            ['string',   '""',   1, 6, 1, 7],
            [')',        ')',    1, 8],
            ['(',        '(',    1, 9],
            ['comment',  '/**/', 1, 10, 1, 13],
            [')',        ')',    1, 14],
            ['(',        '(',    1, 15],
            ['word',     '\\\\', 1, 16, 1, 17],
            [')',        ')',    1, 18],
            ['(',        '(',    1, 19],
            ['space',    '\n'],
            [')',        ')',    2, 1],
            ['(',        '(',    2, 2]
        ]);
    });

    it('tokenizes string', () => {
        test('\'"\'"\\""', [
            ['string', "'\"'",  1, 1, 1, 3],
            ['string', '"\\""', 1, 4, 1, 7]
        ]);
    });

    it('tokenizes escaped string', () => {
        test('"\\\\"', [ ['string', '"\\\\"', 1, 1, 1, 4] ]);
    });

    it('tokenizes at-word', () => {
        test('@word ', [ ['at-word', '@word', 1, 1, 1, 5], ['space', ' '] ]);
    });

    it('tokenizes at-word end', () => {
        test('@one{@two()@three""', [
            ['at-word',  '@one',   1,  1, 1,  4],
            ['{',        '{',      1,  5],
            ['at-word',  '@two',   1,  6, 1,  9],
            ['brackets', '()',     1, 10, 1, 11],
            ['at-word',  '@three', 1, 12, 1, 17],
            ['string',   '""',     1, 18, 1, 19]
        ]);
    });

    it('tokenizes at-symbol', () => {
        test('@', [ ['at-word', '@', 1, 1, 1, 1] ]);
    });

    it('tokenizes comment', () => {
        test('/* a\nb */', [ ['comment', '/* a\nb */', 1, 1, 2, 4] ]);
    });

    it('changes lines in comments', () => {
        test('a/* \n */b', [
            ['word',    'a',        1, 1, 1, 1],
            ['comment', '/* \n */', 1, 2, 2, 3],
            ['word',    'b',        2, 4, 2, 4]
        ]);
    });

    it('tokenizes CSS', () => {
        let css = 'a {\n' +
                  '  content: "a";\n' +
                  '  width: calc(1px;)\n' +
                  '  }\n' +
                  '/* small screen */\n' +
                  '@media screen {}';
        test(css, [
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
            ['brackets', '(1px;)',             3, 14, 3, 19],
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
        expect( () => test(' "') ).to.throw(/:1:2: Unclosed quote/);
    });

    it('fixes unclosed string in safe mode', () => {
        test('"', { safe: true }, [ ['string', '""', 1, 1, 1, 2] ]);
    });

    it('throws error on unclosed comment', () => {
        expect( () => test(' /*') ).to.throw(/:1:2: Unclosed comment/);
    });

    it('fixes unclosed comment in safe mode', () => {
        test('/*', { safe: true }, [ ['comment', '/**/', 1, 1, 1, 4] ]);
    });

});
