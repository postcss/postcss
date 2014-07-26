CssSyntaxError = require('../lib/css-syntax-error');
parse          = require('../lib/parse');

parseError = function (css) {
    var error;
    try {
        parse(css);
    } catch (e) {
        error = e;
    }
    return error;
};

describe('CssSyntaxError', () => {

    it('saves source', () => {
        error = parseError('a {\n  a b {}\n}');

        error.should.be.a.instanceOf(CssSyntaxError);
        error.message.should.be.eql(
            "Can't parse CSS: Unexpected { in decls at line 2:7");
        error.line.should.eql(2);
        error.column.should.eql(7);
        error.source.should.eql('a {\n  a b {}\n}');
    });

    it('highlights broken line', () => {
        parseError('a {\n  a b {}\n}')
            .highlight().should.eql('a {\n' +
                                    '  a b {}\n' +
                                    '      \u001b[1;31m^\u001b[0m\n' +
                                    '}');
    });

    it('highlights without colors on request', () => {
        parseError('a {').highlight(false).should.eql('a {\n' +
                                                      '^');
    });

    it('prints with colored CSS', () => {
        parseError('a {').toString().should.eql(
            "Can't parse CSS: Unclosed block at line 1:1\n" +
            'a {\n' +
            '\u001b[1;31m^\u001b[0m');
    });

});
