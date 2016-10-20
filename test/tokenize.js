import tokenize from '../lib/tokenize';
import Input    from '../lib/input';

import test from 'ava';

function run(t, css, opts, tokens) {
    if ( typeof tokens === 'undefined' ) [tokens, opts] = [opts, tokens];
    t.deepEqual(tokenize(new Input(css, opts)), tokens);
}

function ignoreRun(t, css, tokens) {
    t.deepEqual(tokenize(new Input(css), { ignoreErrors: true }), tokens);
}

test('tokenizes empty file', t => {
    run(t, '', []);
});

test('tokenizes space', t => {
    run(t, '\r\n \f\t', [ ['space', '\r\n \f\t'] ]);
});

test('tokenizes word', t => {
    run(t, 'ab', [ ['word', 'ab', 1, 1, 1, 2] ]);
});

test('splits word by !', t => {
    run(t, 'aa!bb', [
        ['word', 'aa',  1, 1, 1, 2],
        ['word', '!bb', 1, 3, 1, 5]
    ]);
});

test('changes lines in spaces', t => {
    run(t, 'a \n b', [
        ['word',  'a', 1, 1, 1, 1],
        ['space', ' \n '],
        ['word',  'b', 2, 2, 2, 2]
    ]);
});

test('tokenizes control chars', t => {
    run(t, '{:;}', [
        ['{', '{', 1, 1],
        [':', ':', 1, 2],
        [';', ';', 1, 3],
        ['}', '}', 1, 4]
    ]);
});

test('escapes control symbols', t => {
    run(t, '\\(\\{\\"\\@\\\\""', [
        ['word',   '\\(',  1,  1, 1,  2],
        ['word',   '\\{',  1,  3, 1,  4],
        ['word',   '\\"',  1,  5, 1,  6],
        ['word',   '\\@',  1,  7, 1,  8],
        ['word',   '\\\\', 1,  9, 1, 10],
        ['string', '""',   1, 11, 1, 12]
    ]);
});

test('escapes backslash', t => {
    run(t, '\\\\\\\\{', [
        ['word', '\\\\\\\\', 1, 1, 1, 4],
        ['{',    '{',        1, 5]
    ]);
});

test('tokenizes simple brackets', t => {
    run(t, '(ab)', [ ['brackets', '(ab)', 1, 1, 1, 4] ]);
});

test('tokenizes square brackets', t => {
    run(t, 'a[bc]', [
        ['word', 'a',  1, 1, 1, 1],
        ['[',    '[',  1, 2],
        ['word', 'bc', 1, 3, 1, 4],
        [']',    ']',  1, 5]
    ]);
});

test('tokenizes complicated brackets', t => {
    run(t, '(())("")(/**/)(\\\\)(\n)(', [
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

test('tokenizes string', t => {
    run(t, '\'"\'"\\""', [
        ['string', '\'"\'',  1, 1, 1, 3],
        ['string', '"\\""', 1, 4, 1, 7]
    ]);
});

test('tokenizes escaped string', t => {
    run(t, '"\\\\"', [ ['string', '"\\\\"', 1, 1, 1, 4] ]);
});

test('changes lines in strings', t => {
    run(t, '"\n\n""\n\n"', [
        ['string', '"\n\n"', 1, 1, 3, 1],
        ['string', '"\n\n"', 3, 2, 5, 1]
    ]);
});

test('tokenizes at-word', t => {
    run(t, '@word ', [ ['at-word', '@word', 1, 1, 1, 5], ['space', ' '] ]);
});

test('tokenizes at-word end', t => {
    run(t, '@one{@two()@three""@four;', [
        ['at-word',  '@one',   1,  1, 1,  4],
        ['{',        '{',      1,  5],
        ['at-word',  '@two',   1,  6, 1,  9],
        ['brackets', '()',     1, 10, 1, 11],
        ['at-word',  '@three', 1, 12, 1, 17],
        ['string',   '""',     1, 18, 1, 19],
        ['at-word',  '@four',  1, 20, 1, 24],
        [';',        ';',      1, 25]
    ]);
});

test('tokenizes urls', t => {
    run(t, 'url(/*\\))', [ ['word',     'url',     1, 1, 1, 3],
                         ['brackets', '(/*\\))', 1, 4, 1, 9] ]);
});

test('tokenizes quoted urls', t => {
    run(t, 'url(")")', [ ['word',   'url', 1, 1, 1, 3],
                       ['(',      '(',   1, 4],
                       ['string', '")"', 1, 5, 1, 7],
                       [')',      ')',   1, 8] ]);
});

test('tokenizes at-symbol', t => {
    run(t, '@', [ ['at-word', '@', 1, 1, 1, 1] ]);
});

test('tokenizes comment', t => {
    run(t, '/* a\nb */', [ ['comment', '/* a\nb */', 1, 1, 2, 4] ]);
});

test('changes lines in comments', t => {
    run(t, 'a/* \n */b', [
        ['word',    'a',        1, 1, 1, 1],
        ['comment', '/* \n */', 1, 2, 2, 3],
        ['word',    'b',        2, 4, 2, 4]
    ]);
});

test('supports line feed', t => {
    run(t, 'a\fb', [
        ['word',  'a', 1, 1, 1, 1],
        ['space', '\f'],
        ['word',  'b', 2, 1, 2, 1]
    ]);
});

test('supports carriage return', t => {
    run(t, 'a\rb\r\nc', [
        ['word',  'a', 1, 1, 1, 1],
        ['space', '\r'],
        ['word',  'b', 2, 1, 2, 1],
        ['space', '\r\n'],
        ['word',  'c', 3, 1, 3, 1]
    ]);
});

test('tokenizes CSS', t => {
    let css = 'a {\n' +
              '  content: "a";\n' +
              '  width: calc(1px;)\n' +
              '  }\n' +
              '/* small screen */\n' +
              '@media screen {}';
    run(t, css, [
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

test('throws error on unclosed string', t => {
    t.throws(() => {
        tokenize(new Input(' "'));
    }, /:1:2: Unclosed string/);
});

test('throws error on unclosed comment', t => {
    t.throws(() => {
        tokenize(new Input(' /*'));
    }, /:1:2: Unclosed comment/);
});

test('throws error on unclosed url', t => {
    t.throws(() => {
        tokenize(new Input('url('));
    }, /:1:4: Unclosed bracket/);
});

test('ignores unclosing string on request', t => {
    ignoreRun(t, ' "', [['space', ' '], ['string', '\"', 1, 2, 1, 3]]);
});

test('ignores unclosing comment on request', t => {
    ignoreRun(t, ' /*', [['space', ' '], ['comment', '/*', 1, 2, 1, 4]]);
});

test('ignores unclosing comment on request', t => {
    ignoreRun(t, 'url(', [
        ['word',     'url', 1, 1, 1, 3],
        ['brackets', '(',   1, 4, 1, 4]
    ]);
});
