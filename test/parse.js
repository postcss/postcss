import Input from '../lib/input';
import parse from '../lib/parse';
import Root  from '../lib/root';

import { expect } from 'chai';
import   path     from 'path';
import   fs       from 'fs';

let read = name => fs.readFileSync(path.join(__dirname, 'cases', name));

describe('postcss.parse()', () => {

    it('works with file reads', () => {
        let file = path.join(__dirname, 'cases', 'atrule-empty.css');
        let css  = fs.readFileSync(file);
        expect(parse(css, { from: file })).to.be.instanceOf(Root);
    });

    describe('empty file', () => {

        it('parses UTF-8 BOM', () => {
            let css = parse('\uFEFF@host { a {\f} }');
            expect(css.first.before).to.eql('');
        });

        it('parses empty file', () => {
            expect(parse('', { from: 'a.css' })).to.eql(new Root({
                after: '',
                source: {
                    input: new Input('', { from: 'a.css' })
                }
            }));
        });

        it('parses spaces', () => {
            expect(parse(' \n', { from: 'a.css' })).to.eql(new Root({
                after: ' \n',
                source: {
                    input: new Input(' \n', { from: 'a.css' })
                }
            }));
        });

    });

    fs.readdirSync(path.join(__dirname, 'cases')).forEach( name => {
        if ( !name.match(/\.css$/) ) return;

        it('parses ' + name, () => {
            let css  = parse(read(name), { from: '/' + name });
            let json = read(name.replace(/\.css$/, '.json')).toString().trim();
            expect(JSON.stringify(css, null, 4)).to.eql(json);
        });
    });

    it('saves source file', () => {
        let css = parse('a {}', { from: 'a.css' });
        expect(css.first.source.input.file).to.eql(path.resolve('a.css'));
        expect(css.first.source.input.from).to.eql(path.resolve('a.css'));
    });

    it('saves source file on previous map', () => {
        let root1 = parse('a {}', { map: { inline: true } });
        let css   = root1.toResult({ map: { inline: true } }).css;
        let root2 = parse(css);
        expect(root2.first.source.input.file).to.eql(path.resolve('to.css'));
    });

    it('sets unique ID for file without name', () => {
        let css1 = parse('a {}');
        let css2 = parse('a {}');
        expect(css1.first.source.input.id).to.match(/^<input css \d+>$/);
        expect(css1.first.source.input.from).to.match(/^<input css \d+>$/);
        expect(css2.first.source.input.id)
            .to.not.eql(css1.first.source.input.id);
    });

    it('sets parent node', () => {
        let css = parse(read('atrule-rules.css'));

        let support   = css.first;
        let keyframes = support.first;
        let from      = keyframes.first;
        let decl      = from.first;

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
            let root = parse('a {\n} }', { safe: true });
            expect(root.first.toString()).to.eql('a {\n}');
            expect(root.after).to.eql(' }');
        });

        it('throws on unclosed comment', () => {
            expect( () => parse('\n/*\n ') ).to.throw(/:2:1: Unclosed comment/);
        });

        it('fixes unclosed comment in safe mode', () => {
            let root = parse('a { /* b ', { safe: true });
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
            expect( () => parse('a { b;}')   ).to.throw(/:1:5: Unknown word/);
            expect( () => parse('a { b b }') ).to.throw(/:1:5: Unknown word/);
        });

        it('fixes property without value in safe mode', () => {
            let root = parse('a { color: white; one }', { safe: true });
            expect(root.first.nodes.length).to.eql(1);
            expect(root.first.semicolon).to.be.true;
            expect(root.first.after).to.eql(' one ');
        });

        it('fixes 2 properties in safe mode', () => {
            let root = parse('a { one color: white; one }', { safe: true });
            expect(root.first.nodes.length).to.eql(1);
            expect(root.first.first.prop).to.eql('color');
            expect(root.first.first.before).to.eql(' one ');
        });

        it('throws on nameless at-rule', () => {
            expect( () => parse('@') ).to.throw(/:1:1: At-rule without name/);
        });

        it('fixes nameless at-rule in safe mode', () => {
            let root = parse('@', { safe: true });
            expect(root.first.type).to.eql('atrule');
            expect(root.first.name).to.eql('');
        });

        it('throws on property without semicolon', () => {
            expect( () => parse('a { one: 1 two: 2 }') )
                .to.throw(/:1:10: Missed semicolon/);
        });

        it('fixes property without semicolon in safe mode', () => {
            let root = parse('a { one: 1 two: 2 }', { safe: true });
            expect(root.first.nodes.length).to.eql(2);
            expect(root.toString()).to.eql('a { one: 1; two: 2 }');
        });

        it('throws on double colon', () => {
            expect( () => parse('a { one:: 1 }') )
                .to.throw(/:1:9: Double colon/);
        });

        it('fixes double colon in safe mode', () => {
            let root = parse('a { one:: 1 }', { safe: true });
            expect(root.first.first.value).to.eql(': 1');
        });
    });

});
