var Root    = require('../lib/root');
var parse   = require('../lib/parse');

var fs     = require('fs');
var path   = require('path');
var should = require('should');

var read = file => fs.readFileSync(__dirname + '/cases/' + file);

describe('postcss.parse()', () => {

    it('works with file reads', () => {
        var css = fs.readFileSync(__dirname + '/cases/atrule-empty.css');
        parse(css).should.be.instanceOf(Root);
    });

    describe('empty file', () => {

        it('parses UTF-8 BOM', () => {
            var css = parse('\uFEFF@host { a {\f} }');
            css.first.before.should.eql('');
        });

        it('parses empty file', () => {
            parse('').should.eql({ type: 'root', childs: [], after: '' });
        });

        it('parses spaces', () => {
            parse(" \n").should.eql({ type: 'root', childs: [], after: " \n" });
        });

    });

    fs.readdirSync(__dirname + '/cases/').forEach( (file) => {
        if ( !file.match(/\.css$/) ) return;

        it('parses ' + file, () => {
            var css  = parse(read(file), { from: '/' + file });
            var json = read(file.replace(/\.css$/, '.json')).toString().trim();
            JSON.stringify(css, null, 4).should.eql(json);
        });
    });

    it('saves source file', () => {
        var css = parse('a {}', { from: 'a.css' });
        css.first.source.file.should.eql(path.resolve('a.css'));
    });

    it('saves source file on previous map', () => {
        var root1 = parse('a {}', { map: { inline: true } });
        var css   = root1.toResult({ map: { inline: true } }).css;
        var root2 = parse(css);
        root2.first.source.file.should.eql(path.resolve('to.css'));
    });

    it('sets unique ID for file without name', () => {
        var css1 = parse('a {}');
        var css2 = parse('a {}');
        css1.first.source.id.should.match(/^<input css \d+>$/);
        css2.first.source.id.should.not.eql(css1.first.source.id);
    });

    it('sets parent node', () => {
        var css = parse(read('atrule-rules.css'));

        var support   = css.first;
        var keyframes = support.first;
        var from      = keyframes.first;
        var decl      = from.first;

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

        it('throws on unclosed bracket', () => {
            ( () => parse(':not(one() { }') ).should
                .throw(/:1:5: Unclosed bracket/);
        });

        it('fixes unclosed bracket', () => {
            var root = parse(':not(one() { }', { safe: true });
            root.after.should.eql(':not(one() { }');
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

        it('fixes 2 properties in safe mode', () => {
            var root = parse('a { one color: white; one }', { safe: true });
            root.first.childs.length.should.eql(1);
            root.first.first.prop.should.eql('color');
            root.first.first.before.should.eql(' one ');
        });

        it('throws on nameless at-rule', () => {
            ( () => parse('@') ).should.throw(/:1:1: At-rule without name/);
        });

        it('fixes nameless at-rule in safe mode', () => {
            var root = parse('@', { safe: true });
            root.first.type.should.eql('atrule');
            root.first.name.should.eql('');
        });

        it('parses IE colon', () => {
            parse('a { filter: progid:DXImageTransform }')
                .first.first.value.should.eql('progid:DXImageTransform');
        });

        it('throws on property without semicolon', () => {
            ( () => parse('a { one: 1 two: 2 }') )
                .should.throw(/:1:10: Missed semicolon/);
        });

        it('fixes property without semicolon in safe mode', () => {
            var root = parse('a { one: 1 two: 2 }', { safe: true });
            root.first.childs.length.should.eql(2);
            root.toString().should.eql('a { one: 1; two: 2 }');
        });

    });

});
