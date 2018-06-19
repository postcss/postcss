'use strict';

const CssSyntaxError = require('../lib/css-syntax-error');
const postcss        = require('../lib/postcss');

const stripAnsi = require('strip-ansi');
const Concat    = require('concat-with-sourcemaps');
const chalk     = require('chalk');
const path      = require('path');

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

it('saves source', () => {
    let error = parseError('a {\n  content: "\n}');

    expect(error instanceof CssSyntaxError).toBeTruthy();
    expect(error.name).toEqual('CssSyntaxError');
    expect(error.message).toEqual('<css input>:2:12: Unclosed string');
    expect(error.reason).toEqual('Unclosed string');
    expect(error.line).toEqual(2);
    expect(error.column).toEqual(12);
    expect(error.source).toEqual('a {\n  content: "\n}');

    expect(error.input).toEqual({
        line:   error.line,
        column: error.column,
        source: error.source
    });
});

it('has stack trace', () => {
    expect(parseError('a {\n  content: "\n}').stack)
        .toMatch(/css-syntax-error\.test\.js/);
});

it('highlights broken line with colors', () => {
    let c = chalk;
    expect(parseError('a {').showSourceCode(true)).toEqual(
        c.red.bold('>') + c.gray(' 1 | ') + 'a ' + c.yellow('{') + '\n ' +
        c.gray('   | ') + c.red.bold('^'));
});

it('highlights broken line', () => {
    expect(parseError('a {\n  content: "\n}').showSourceCode(false))
        .toEqual('  1 | a {\n' +
                 '> 2 |   content: "\n' +
                 '    |            ^\n' +
                 '  3 | }');
});

it('highlights broken line, when indented with tabs', () => {
    expect(parseError('a {\n\t \t  content:\t"\n}').showSourceCode(false))
        .toEqual('  1 | a {\n' +
                 '> 2 | \t \t  content:\t"\n' +
                 '    | \t \t          \t^\n' +
                 '  3 | }');
});

it('highlights small code example', () => {
    expect(parseError('a {').showSourceCode(false))
        .toEqual('> 1 | a {\n' +
                 '    | ^');
});

it('add leading space for line numbers', () => {
    let css = '\n\n\n\n\n\n\na {\n  content: "\n}\n\n\n';
    expect(parseError(css).showSourceCode(false))
        .toEqual('   7 | \n' +
                 '   8 | a {\n' +
                 '>  9 |   content: "\n' +
                 '     |            ^\n' +
                 '  10 | }\n' +
                 '  11 | ');
});

it('prints with highlight', () => {
    expect(stripAnsi(parseError('a {').toString()))
        .toEqual('CssSyntaxError: <css input>:1:1: Unclosed block\n' +
                 '\n' +
                 '> 1 | a {\n' +
                 '    | ^\n');
});

it('misses highlights without source content', () => {
    let error = parseError('a {');
    error.source = null;
    expect(error.toString())
        .toEqual('CssSyntaxError: <css input>:1:1: Unclosed block');
});

it('misses position without source', () => {
    let decl  = postcss.decl({ prop: 'color', value: 'black' });
    let error = decl.error('Test');
    expect(error.toString()).toEqual('CssSyntaxError: <css input>: Test');
});

it('uses source map', () => {
    let concat = new Concat(true, 'all.css');
    concat.add('a.css', 'a { }\n');
    concat.add('b.css', '\nb {\n');

    let error = parseError(concat.content, {
        from: 'build/all.css',
        map:  { prev: concat.sourceMap }
    });

    expect(error.file).toEqual(path.resolve('b.css'));
    expect(error.line).toEqual(2);
    expect(error.source).not.toBeDefined();

    expect(error.input).toEqual({
        file:   path.resolve('build/all.css'),
        line:   3,
        column: 1,
        source: 'a { }\n\nb {\n'
    });
});

it('shows origin source', () => {
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
    expect(error.source).toEqual('a{}');
});

it('does not uses wrong source map', () => {
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
    expect(error.file).toEqual(path.resolve('build/all.css'));
});

it('set source plugin', () => {
    let error = postcss.parse('a{}').first.error('Error', { plugin: 'PL' });
    expect(error.plugin).toEqual('PL');
    expect(error.toString())
        .toMatch(/^CssSyntaxError: PL: <css input>:1:1: Error/);
});

it('set source plugin automatically', () => {
    let plugin = postcss.plugin('test-plugin', () => {
        return css => {
            throw css.first.error('Error');
        };
    });

    return postcss([plugin]).process('a{}').catch( error => {
        if ( error.name !== 'CssSyntaxError' ) throw error;
        expect(error.plugin).toEqual('test-plugin');
        expect(error.toString()).toMatch(/test-plugin/);
    });
});

it('set plugin automatically in async', () => {
    let plugin = postcss.plugin('async-plugin', () => {
        return css => {
            return new Promise( (resolve, reject) => {
                reject(css.first.error('Error'));
            });
        };
    });

    return postcss([plugin]).process('a{}').catch( error => {
        if ( error.name !== 'CssSyntaxError' ) throw error;
        expect(error.plugin).toEqual('async-plugin');
    });
});
