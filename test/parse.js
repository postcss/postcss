var Root  = require('../lib/root');
var parse = require('../lib/parse');

var fs   = require('fs');
var path = require('path');

var read = file => fs.readFileSync(__dirname + '/cases/parse/' + file);

describe('postcss.parse()', () => {

    it('works with file reads', () => {
        var css = fs.readFileSync(__dirname + '/cases/parse/atrule-empty.css');
        parse(css).should.be.instanceOf(Root);
    });

    describe('empty file', () => {

        it('parses UTF-8 BOM', () => {
            parse('\uFEFF@host { a {\f} }');
        });

        it('parses empty file', () => {
            parse('').should.eql({ type: 'root', childs: [], after: '' });
        });

        it('parses spaces', () => {
            parse(" \n").should.eql({ type: 'root', childs: [], after: " \n" });
        });

    });

    fs.readdirSync(__dirname + '/cases/parse/').forEach( (file) => {
        if ( !file.match(/\.css$/) ) return;

        it('parses ' + file, () => {
            var css  = parse(read(file), { from: '/' + file });
            var json = read(file.replace(/\.css$/, '.json')).toString().trim();
            JSON.stringify(css, null, 4).should.eql(json);
        });
    });

    it('saves source file', () => {
        var css = parse('a {}', { from: 'a.css' });
        css.childs[0].source.file.should.eql(path.resolve('a.css'));
    });

    it('sets unique ID for file without name', () => {
        var css1 = parse('a {}');
        var css2 = parse('a {}');
        css1.childs[0].source.id.should.match(/^<input css \d+>$/);
        css2.childs[0].source.id.should.not.eql(css1.childs[0].source.id);
    });

    it('sets parent node', () => {
        var css = parse(read('atrule-rules.css'));

        var support   = css.childs[0];
        var keyframes = support.childs[0];
        var from      = keyframes.childs[0];
        var decl      = from.childs[0];

        decl.parent.should.exactly(from);
        from.parent.should.exactly(keyframes);
        keyframes.parent.should.exactly(support);
        support.parent.should.exactly(css);
    });

    describe('errors', () => {

        it('throws on unclosed blocks', () => {
            ( () => parse('\na {\n') ).should
                .throw(/:2:1: Unclosed block/);
        });

        it('fixes unclosed blocks in safe mode', () => {
            parse('@media (screen) { a {\n', { safe: true })
                .toString().should.eql('@media (screen) { a {\n}}');

            parse('a { color', { safe: true })
                .toString().should.eql('a { color}');
        });

        it('throws on unnecessary block close', () => {
            ( () => parse('a {\n} }') ).should
                .throw(/:2:3: Unexpected }/);
        });

        it('fixes unnecessary block close in safe mode', () => {
            var root = parse('a {\n} }', { safe: true });
            root.first.toString().should.eql('a {\n}');
            root.after.should.eql(' }');
        });

        it('throws on unclosed comment', () => {
            ( () => parse('\n/*\n\n ') ).should
                .throw(/:2:1: Unclosed comment/);
        });

        it('fixes unclosed comment in safe mode', () => {
            var root = parse('a { /* b ', { safe: true });
            root.toString().should.eql('a { /* b */}');
            root.first.first.text.should.eql('b');
        });

        it('throws on unclosed quote', () => {
            ( () => parse('\n"\n\na ') ).should
                .throw(/:2:1: Unclosed quote/);
        });

        it('fixes unclosed quote in safe mode', () => {
            parse('a { content: "b', { safe: true }).
                toString().should.eql('a { content: "b"}');
        });

        it('throws on property without value', () => {
            ( () => parse("a { b;}") ).should
                .throw(/:1:5: Unknown word/);
            ( () => parse("a { b b }") ).should
                .throw(/:1:5: Unknown word/);
        });

        it('fixes property without value in safe mode', () => {
            var root = parse('a { color: white; one }', { safe: true });
            root.first.childs.length.should.eql(1);
            root.first.semicolon.should.be.true;
            root.first.after.should.eql(' one ');
        });

        it('throws on nameless at-rule', () => {
            ( () => parse('@') ).should.throw(/:1:1: At-rule without name/);
        });

    });

});
