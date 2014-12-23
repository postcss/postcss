var Root    = require('../lib/root');
var parse   = require('../lib/parse');

var fs     = require('fs');
var path   = require('path');
var expect = require('chai').expect;

var read = file => fs.readFileSync(__dirname + '/cases/' + file);

describe('postcss.parse()', () => {

    it('works with file reads', () => {
        var css = fs.readFileSync(__dirname + '/cases/atrule-empty.css');
        expect(parse(css)).to.be.instanceOf(Root);
    });

    describe('empty file', () => {

        it('parses UTF-8 BOM', () => {
            var css = parse('\uFEFF@host { a {\f} }');
            expect(css.first.before).to.eql('');
        });

        it('parses empty file', () => {
            expect(parse('')).to.eql(new Root({ after: '' }));
        });

        it('parses spaces', () => {
            expect(parse(' \n')).to.eql(new Root({ after: ' \n' }));
        });

    });

    fs.readdirSync(__dirname + '/cases/').forEach( (file) => {
        if ( !file.match(/\.css$/) ) return;

        it('parses ' + file, () => {
            var css  = parse(read(file), { from: '/' + file });
            var json = read(file.replace(/\.css$/, '.json')).toString().trim();
            expect(JSON.stringify(css, null, 4)).to.eql(json);
        });
    });

    it('saves source file', () => {
        var css = parse('a {}', { from: 'a.css' });
        expect(css.first.source.input.file).to.eql(path.resolve('a.css'));
        expect(css.first.source.input.from).to.eql(path.resolve('a.css'));
    });

    it('saves source file on previous map', () => {
        var root1 = parse('a {}', { map: { inline: true } });
        var css   = root1.toResult({ map: { inline: true } }).css;
        var root2 = parse(css);
        expect(root2.first.source.input.file).to.eql(path.resolve('to.css'));
    });

    it('sets unique ID for file without name', () => {
        var css1 = parse('a {}');
        var css2 = parse('a {}');
        expect(css1.first.source.input.id).to.match(/^<input css \d+>$/);
        expect(css1.first.source.input.from).to.match(/^<input css \d+>$/);
        expect(css2.first.source.input.id)
            .to.not.eql(css1.first.source.input.id);
    });

    it('sets parent node', () => {
        var css = parse(read('atrule-rules.css'));

        var support   = css.first;
        var keyframes = support.first;
        var from      = keyframes.first;
        var decl      = from.first;

        expect(decl.parent).to.equal(from);
        expect(from.parent).to.equal(keyframes);
        expect(keyframes.parent).to.equal(support);
        expect(support.parent).to.equal(css);
    });

    describe('errors', () => {

        it('throws on unclosed blocks', () => {
            expect( () => parse('\na {\n') ).to.throw(/:2:1: Unclosed block/);
        });

        it('fixes unclosed blocks in safe mode', () => {
            expect(parse('@media (screen) { a {\n', { safe: true }).toString())
                .to.eql('@media (screen) { a {\n}}');

            expect(parse('a { color', { safe: true }).toString())
                .to.eql('a { color}');

            expect(parse('a { color: black', { safe: true }).first.first.prop)
                .to.eql('color');
        });

        it('throws on unnecessary block close', () => {
            expect( () => parse('a {\n} }') ).to.throw(/:2:3: Unexpected }/);
        });

        it('fixes unnecessary block close in safe mode', () => {
            var root = parse('a {\n} }', { safe: true });
            expect(root.first.toString()).to.eql('a {\n}');
            expect(root.after).to.eql(' }');
        });

        it('throws on unclosed comment', () => {
            expect( () => parse('\n/*\n ') ).to.throw(/:2:1: Unclosed comment/);
        });

        it('fixes unclosed comment in safe mode', () => {
            var root = parse('a { /* b ', { safe: true });
            expect(root.toString()).to.eql('a { /* b */}');
            expect(root.first.first.text).to.eql('b');
        });

        it('throws on unclosed quote', () => {
            expect( () => parse('\n"\n\na ') ).to.throw(/:2:1: Unclosed quote/);
        });

        it('fixes unclosed quote in safe mode', () => {
            expect(parse('a { content: "b', { safe: true }).toString())
                .to.eql('a { content: "b"}');
        });

        it('throws on unclosed bracket', () => {
            expect( () => parse(':not(one() { }') )
                .to.throw(/:1:5: Unclosed bracket/);
        });

        it('fixes unclosed bracket', () => {
            expect(parse(':not(one() { }', { safe: true }).after)
                .to.eql(':not(one() { }');
        });

        it('throws on property without value', () => {
            expect( () => parse("a { b;}")   ).to.throw(/:1:5: Unknown word/);
            expect( () => parse("a { b b }") ).to.throw(/:1:5: Unknown word/);
        });

        it('fixes property without value in safe mode', () => {
            var root = parse('a { color: white; one }', { safe: true });
            expect(root.first.nodes.length).to.eql(1);
            expect(root.first.semicolon).to.be.true;
            expect(root.first.after).to.eql(' one ');
        });

        it('fixes 2 properties in safe mode', () => {
            var root = parse('a { one color: white; one }', { safe: true });
            expect(root.first.nodes.length).to.eql(1);
            expect(root.first.first.prop).to.eql('color');
            expect(root.first.first.before).to.eql(' one ');
        });

        it('throws on nameless at-rule', () => {
            expect( () => parse('@') ).to.throw(/:1:1: At-rule without name/);
        });

        it('fixes nameless at-rule in safe mode', () => {
            var root = parse('@', { safe: true });
            expect(root.first.type).to.eql('atrule');
            expect(root.first.name).to.eql('');
        });

        it('throws on property without semicolon', () => {
            expect( () => parse('a { one: 1 two: 2 }') )
                .to.throw(/:1:10: Missed semicolon/);
        });

        it('fixes property without semicolon in safe mode', () => {
            var root = parse('a { one: 1 two: 2 }', { safe: true });
            expect(root.first.nodes.length).to.eql(2);
            expect(root.toString()).to.eql('a { one: 1; two: 2 }');
        });

    });

});
