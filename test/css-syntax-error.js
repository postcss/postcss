var CssSyntaxError = require('../lib/css-syntax-error');
var parse          = require('../lib/parse');

var Concat = require('concat-with-sourcemaps');
var should = require('should');

var parseError = function (css, opts) {
    var error;
    try {
        parse(css, opts);
    } catch (e) {
        error = e;
    }
    return error;
};

describe('CssSyntaxError', () => {

    it('saves source', () => {
        var error = parseError('a {\n  content: "\n}');

        error.should.be.a.instanceOf(CssSyntaxError);
        error.message.should.be.eql('<css input>:2:12: Unclosed quote');
        error.reason.should.eql('Unclosed quote');
        error.line.should.eql(2);
        error.column.should.eql(12);
        error.source.should.eql('a {\n  content: "\n}');
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
        parseError('a {').toString().should.eql(
            "<css input>:1:1: Unclosed block\n" +
            'a {\n' +
            '\u001b[1;31m^\u001b[0m');
    });

    it('miss highlights without source', () => {
        var error = parseError('a {');
        error.source = null;
        error.toString().should.eql('<css input>:1:1: Unclosed block');
    });

    it('uses source map', () => {
        var join = new Concat(true, 'all.css');
        join.add('a.css', 'a { }');
        join.add('b.css', 'b {');

        var error = parseError(join.content, { map: { prev: join.sourceMap } });

        error.file.should.eql('b.css');
        error.line.should.eql(1);
        should.not.exists(error.source);

        error.generated.should.eql({
            file: 'all.css',
            line: 2,
            column: 1,
            source: 'a { }\nb {'
        });
    });

});
