var CssSyntaxError = require('../lib/css-syntax-error');
var parse          = require('../lib/parse');

var Concat = require('concat-with-sourcemaps');
var should = require('should');
var path   = require('path');

var parseError = function (css, opts) {
    var error;
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
        var error = parseError('a {\n  content: "\n}');

        error.should.be.a.instanceOf(CssSyntaxError);
        error.name.should.eql('CssSyntaxError');
        error.message.should.be.eql('<css input>:2:12: Unclosed quote');
        error.reason.should.eql('Unclosed quote');
        error.line.should.eql(2);
        error.column.should.eql(12);
        error.source.should.eql('a {\n  content: "\n}');
    });

    it('has stack trace', () => {
        parseError('a {\n  content: "\n}').stack.should.containEql(
            'test/css-syntax-error.js');
    });

    it('highlights broken line', () => {
        parseError('a {\n  content: "\n}')
            .highlight().should.eql('a {\n' +
                                    '  content: "\n' +
                                    '           \u001b[1;31m^\u001b[0m\n' +
                                    '}');
    });

    it('highlights without colors on request', () => {
        parseError('a {').highlight(false).should.eql('a {\n' +
                                                      '^');
    });

    it('prints with colored CSS', () => {
        parseError('a {').toString().should.startWith(
            "CssSyntaxError: <css input>:1:1: Unclosed block\n" +
            'a {\n' +
            '\u001b[1;31m^\u001b[0m');
    });

    it('misses highlights without source', () => {
        var error = parseError('a {');
        error.source = null;
        error.toString().should.startWith('CssSyntaxError: <css input>:1:1: Unclosed block');
    });

    it('uses source map', () => {
        var concat = new Concat(true, 'all.css');
        concat.add('a.css', 'a { }');
        concat.add('b.css', 'b {');

        var error = parseError(concat.content, {
            from: 'build/all.css',
            map: { prev: concat.sourceMap }
        });

        error.file.should.eql(path.resolve('b.css'));
        error.line.should.eql(1);
        should.not.exists(error.source);

        error.generated.should.eql({
            file:    path.resolve('build/all.css'),
            line:    2,
            column:  1,
            source: 'a { }\nb {'
        });
    });

    it('does not uses wrong source map', () => {
        var error = parseError('a { }\nb {', {
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
        error.file.should.eql(path.resolve('build/all.css'));
    });

    it('should have a stack trace', () => {
        var error = parseError('a {\n  content: "\n}');

        error.stack.exists;
    });

});
