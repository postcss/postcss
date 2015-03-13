import CssSyntaxError from '../lib/css-syntax-error';
import parse          from '../lib/parse';

import   Concat   from 'concat-with-sourcemaps';
import { expect } from 'chai';
import   path     from 'path';

let parseError = function (css, opts) {
    let error;
    try {
        parse(css, opts);
    } catch (e) {
        if ( e instanceof CssSyntaxError ) {
            error = e;
        } else {
            throw e;
        }
    }
    return error;
};

describe('CssSyntaxError', () => {

    it('saves source', () => {
        let error = parseError('a {\n  content: "\n}');

        expect(error).to.be.a.instanceOf(CssSyntaxError);
        expect(error.name).to.eql('CssSyntaxError');
        expect(error.message).to.be.eql('<css input>:2:12: Unclosed quote');
        expect(error.reason).to.eql('Unclosed quote');
        expect(error.line).to.eql(2);
        expect(error.column).to.eql(12);
        expect(error.source).to.eql('a {\n  content: "\n}');

        expect(error.generated).to.eql({
            line:   error.line,
            column: error.column,
            source: error.source
        });
    });

    it('has stack trace', () => {
        expect(parseError('a {\n  content: "\n}').stack)
            .to.match(/test\/css-syntax-error\.js/);
    });

    it('highlights broken line', () => {
        expect(parseError('a {\n  content: "\n}').showSourceCode()).to.eql(
            '\n' +
            'a {\n' +
            '  content: "\n' +
            '           \u001b[1;31m^\u001b[0m\n' +
            '}');
    });

    it('highlights without colors on request', () => {
        expect(parseError('a {').showSourceCode(false)).to.eql(
            '\n' +
            'a {\n' +
            '^');
    });

    it('prints with colored CSS', () => {
        expect(parseError('a {').toString()).to.eql(
            'CssSyntaxError: <css input>:1:1: Unclosed block\n' +
            'a {\n' +
            '\u001b[1;31m^\u001b[0m');
    });

    it('misses highlights without source', () => {
        let error = parseError('a {');
        error.source = null;
        expect(error.toString()).to.eql(
            'CssSyntaxError: <css input>:1:1: Unclosed block');
    });

    it('uses source map', () => {
        let concat = new Concat(true, 'all.css');
        concat.add('a.css', 'a { }\n');
        concat.add('b.css', '\nb {\n');

        let error = parseError(concat.content, {
            from: 'build/all.css',
            map: { prev: concat.sourceMap }
        });

        expect(error.file).to.eql(path.resolve('b.css'));
        expect(error.line).to.eql(2);
        expect(error.source).to.not.exist;

        expect(error.generated).to.eql({
            file:    path.resolve('build/all.css'),
            line:    3,
            column:  1,
            source: 'a { }\n\nb {\n'
        });
    });

    it('does not uses wrong source map', () => {
        let error = parseError('a { }\nb {', {
            from: 'build/all.css',
            map: {
                prev: {
                    version: 3,
                    file: 'build/all.css',
                    sources: ['a.css', 'b.css'],
                    mappings: 'A'
                }
            }
        });
        expect(error.file).to.eql(path.resolve('build/all.css'));
    });

    it('set source plugin', () => {
        let error = parse('a{}').first.error('Error', { plugin: 'test' });
        expect(error.plugin).to.eql('test');
        expect(error.toString()).to.match(
            /^CssSyntaxError: test:<css input>:1:1: Error/);
    });

});
