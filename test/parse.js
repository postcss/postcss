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
            parse('').should.eql({ type: 'root', rules: [], after: '' });
        });

        it('parses spaces', () => {
            parse(" \n").should.eql({ type: 'root', rules: [], after: " \n" });
        });

    });

    fs.readdirSync(__dirname + '/cases/parse/').forEach( (file) => {
        if ( !file.match(/\.css$/) ) return;

        it('parses ' + file, () => {
            var css  = parse(read(file));
            var json = read(file.replace(/\.css$/, '.json')).toString().trim();
            JSON.stringify(css, null, 4).should.eql(json);
        });
    });

    it('saves source file', () => {
        var css = parse('a {}', { from: 'a.css' });
        css.rules[0].source.file.should.eql(path.resolve('a.css'));
    });

    it('sets parent node', () => {
        var css = parse(read('atrule-rules.css'));

        var support   = css.rules[0];
        var keyframes = support.rules[0];
        var from      = keyframes.rules[0];
        var decl      = from.decls[0];

        decl.parent.should.exactly(from);
        from.parent.should.exactly(keyframes);
        keyframes.parent.should.exactly(support);
        support.parent.should.exactly(css);
    });

    describe('errors', () => {

        it('throws on unclosed blocks', () => {
            ( () => parse('\na {\n') ).should
                .throw(/Unclosed block at line 2:1/);
        });

        it('fixes unclosed blocks in safe mode', () => {
            parse('@media (screen) { a {\n', { safe: true })
                .toString().should.eql('@media (screen) { a {\n}}');

            parse('a { color', { safe: true })
                .first.first.prop.should.eql('color');
        });

        it('throws on unnecessary block close', () => {
            ( () => parse('a {\n} }') ).should
                .throw(/Unexpected } at line 2:3/);
        });

        it('fixes unnecessary block close in safe mode', () => {
            var root = parse('a {\n} }', { safe: true });
            root.first.toString().should.eql('a {\n}');
            root.after.should.eql(' }');
        });

        it('throws on unclosed comment', () => {
            ( () => parse('\n/*\n\n ') ).should
                .throw(/Unclosed comment at line 2:1/);
        });

        it('fixes unclosed comment in safe mode', () => {
            var root = parse('a { /* b ', { safe: true });
            root.toString().should.eql('a { /* b */}');
            root.first.first.text.should.eql('b');
        });

        it('throws on unclosed quote', () => {
            ( () => parse('\n"\n\na ') ).should
                .throw(/Unclosed quote at line 2:1/);
        });

        it('fixes unclosed quote in safe mode', () => {
            parse('a { content: "b', { safe: true }).
                toString().should.eql('a { content: "b}');
        });

        it('throws on property without value', () => {
            ( () => parse("a { b;}") ).should
                .throw(/Missing property value/);
            ( () => parse("a { b }") ).should
                .throw(/Missing property value/);
        });

        it('fixes property without value in safe mode', () => {
            var root = parse('a { color: white; one }', { safe: true });
            root.first.decls.length.should.eql(1);
            root.first.semicolon.should.be.true;
            root.first.after.should.eql(' one ');
        });

        it('throws on nameless at-rule', () => {
            ( () => parse('@') ).should.throw(/At-rule without name/);
        });

        it('throws on block inside declarations', () => {
            ( () => parse("a {{}}") ).should.throw(/Unexpected \{/);
        });

        it('throw on rules in declarations at-rule', () => {
            ( () => parse('@page { a { } }') ).should.throw(/Unexpected \{/);
        });

        it('adds properties to error', () => {
            var error;
            try {
                parse('a {');
            } catch (e) {
                error = e;
            }

            error.line.should.eql(1);
            error.column.should.eql(1);
            error.source.should.eql('a {');
        });

    });

});
