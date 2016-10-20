import CssSyntaxError from '../lib/css-syntax-error';
import postcss        from '../lib/postcss';

import stripAnsi from 'strip-ansi';
import Concat    from 'concat-with-sourcemaps';
import chalk     from 'chalk';
import path      from 'path';
import test      from 'ava';

function parseError(css, opts) {
    let error;
    try {
        postcss.parse(css, opts);
    } catch (e) {
        if ( e.name === 'CssSyntaxError' ) {
            error = e;
        } else {
            throw e;
        }
    }
    return error;
}

test('saves source', t => {
    let error = parseError('a {\n  content: "\n}');

    t.truthy(error instanceof CssSyntaxError);
    t.deepEqual(error.name, 'CssSyntaxError');
    t.deepEqual(error.message, '<css input>:2:12: Unclosed string');
    t.deepEqual(error.reason, 'Unclosed string');
    t.deepEqual(error.line, 2);
    t.deepEqual(error.column, 12);
    t.deepEqual(error.source, 'a {\n  content: "\n}');

    t.deepEqual(error.input, {
        line:   error.line,
        column: error.column,
        source: error.source
    });
});

test('has stack trace', t => {
    t.regex(parseError('a {\n  content: "\n}').stack, /css-syntax-error\.js/);
});

test('highlights broken line with colors', t => {
    let c = new chalk.constructor({ enabled: true });
    t.deepEqual(parseError('a {').showSourceCode(true),
        c.red.bold('>') + c.grey(' 1 | ') + 'a ' + c.yellow('{') + '\n' +
        ' ' + c.grey('   | ') + c.red.bold('^'));
});

test('highlights broken line', t => {
    t.deepEqual(parseError('a {\n  content: "\n}').showSourceCode(false),
        '  1 | a {\n' +
        '> 2 |   content: "\n' +
        '    |            ^\n' +
        '  3 | }');
});

test('highlights broken line, when indented with tabs', t => {
    t.deepEqual(parseError('a {\n\t \t  content:\t"\n}').showSourceCode(false),
        '  1 | a {\n' +
        '> 2 | \t \t  content:\t"\n' +
        '    | \t \t          \t^\n' +
        '  3 | }');
});

test('highlights small code example', t => {
    t.deepEqual(parseError('a {').showSourceCode(false),
        '> 1 | a {\n' +
        '    | ^');
});

test('add leading space for line numbers', t => {
    let css = '\n\n\n\n\n\n\na {\n  content: "\n}\n\n\n';
    t.deepEqual(parseError(css).showSourceCode(false),
        '   7 | \n' +
        '   8 | a {\n' +
        '>  9 |   content: "\n' +
        '     |            ^\n' +
        '  10 | }\n' +
        '  11 | ');
});

test('prints with highlight', t => {
    t.deepEqual(stripAnsi(parseError('a {').toString()),
        'CssSyntaxError: <css input>:1:1: Unclosed block\n' +
        '\n' +
        '> 1 | a {\n' +
        '    | ^\n');
});

test('misses highlights without source content', t => {
    let error = parseError('a {');
    error.source = null;
    t.deepEqual(error.toString(),
        'CssSyntaxError: <css input>:1:1: Unclosed block');
});

test('misses position without source', t => {
    let decl  = postcss.decl({ prop: 'color', value: 'black' });
    let error = decl.error('Test');
    t.deepEqual(error.toString(), 'CssSyntaxError: <css input>: Test');
});

test('uses source map', t => {
    let concat = new Concat(true, 'all.css');
    concat.add('a.css', 'a { }\n');
    concat.add('b.css', '\nb {\n');

    let error = parseError(concat.content, {
        from: 'build/all.css',
        map:  { prev: concat.sourceMap }
    });

    t.deepEqual(error.file, path.resolve('b.css'));
    t.deepEqual(error.line, 2);
    t.deepEqual(typeof error.source, 'undefined');

    t.deepEqual(error.input, {
        file:   path.resolve('build/all.css'),
        line:   3,
        column: 1,
        source: 'a { }\n\nb {\n'
    });
});

test('shows origin source', t => {
    let input = postcss().process('a{}', {
        from: '/a.css',
        to:   '/b.css',
        map:  { inline: false }
    });
    let error = parseError('a{', {
        from: '/b.css',
        to:   '/c.css',
        map:  { prev: input.map }
    });
    t.deepEqual(error.source, 'a{}');
});

test('does not uses wrong source map', t => {
    let error = parseError('a { }\nb {', {
        from: 'build/all.css',
        map:  {
            prev: {
                version:  3,
                file:     'build/all.css',
                sources:  ['a.css', 'b.css'],
                mappings: 'A'
            }
        }
    });
    t.deepEqual(error.file, path.resolve('build/all.css'));
});

test('set source plugin', t => {
    let error = postcss.parse('a{}').first.error('Error', { plugin: 'PL' });
    t.deepEqual(error.plugin, 'PL');
    t.regex(error.toString(), /^CssSyntaxError: PL: <css input>:1:1: Error/);
});

test('set source plugin automatically', t => {
    let plugin = postcss.plugin('test-plugin', () => {
        return css => {
            throw css.first.error('Error');
        };
    });

    return postcss([plugin]).process('a{}').catch( error => {
        if ( error.name !== 'CssSyntaxError' ) throw error;
        t.deepEqual(error.plugin, 'test-plugin');
        t.regex(error.toString(), /test-plugin/);
    });
});

test('set plugin automatically in async', t => {
    let plugin = postcss.plugin('async-plugin', () => {
        return css => {
            return new Promise( (resolve, reject) => {
                reject(css.first.error('Error'));
            });
        };
    });

    return postcss([plugin]).process('a{}').catch( error => {
        if ( error.name !== 'CssSyntaxError' ) throw error;
        t.deepEqual(error.plugin, 'async-plugin');
    });
});
