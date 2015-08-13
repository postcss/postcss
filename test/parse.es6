import Input from '../lib/input';
import parse from '../lib/parse';
import Root  from '../lib/root';

import { expect } from 'chai';
import   cases    from 'postcss-parser-tests';
import   path     from 'path';
import   fs       from 'fs';

describe('postcss.parse()', () => {

    it('works with file reads', () => {
        let stream = fs.readFileSync(cases.path('atrule-empty.css'));
        expect(parse(stream)).to.be.instanceOf(Root);
    });

    describe('empty file', () => {

        it('parses UTF-8 BOM', () => {
            let css = parse('\uFEFF@host { a {\f} }');
            expect(css.first.raws.before).to.eql('');
        });

        it('parses empty file', () => {
            expect(parse('', { from: 'a.css' })).to.eql(new Root({
                raws: {
                    after: ''
                },
                source: {
                    input: new Input('', { from: 'a.css' })
                }
            }));
        });

        it('parses spaces', () => {
            expect(parse(' \n', { from: 'a.css' })).to.eql(new Root({
                raws: {
                    after: ' \n'
                },
                source: {
                    input: new Input(' \n', { from: 'a.css' })
                }
            }));
        });

    });

    cases.each( (name, css, json) => {
        it('parses ' + name, () => {
            let parsed = cases.jsonify(parse(css, { from: name }));
            expect(parsed).to.eql(json);
        });
    });

    it('saves source file', () => {
        let css = parse('a {}', { from: 'a.css' });
        expect(css.first.source.input.css).to.eql('a {}');
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
        let file = cases.path('atrule-rules.css');
        let css  = parse(fs.readFileSync(file));

        let support   = css.first;
        let keyframes = support.first;
        let from      = keyframes.first;
        let decl      = from.first;

        expect(decl.parent).to.equal(from);
        expect(from.parent).to.equal(keyframes);
        expect(keyframes.parent).to.equal(support);
        expect(support.parent).to.equal(css);
    });

    it('ignores wrong close bracket', () => {
        let root = parse('a { p: ()) }');
        expect(root.first.first.value).to.eql('())');
    });

    describe('errors', () => {

        it('throws on unclosed blocks', () => {
            expect( () => parse('\na {\n') ).to.throw(/:2:1: Unclosed block/);
        });

        it('throws on unnecessary block close', () => {
            expect( () => parse('a {\n} }') ).to.throw(/:2:3: Unexpected }/);
        });

        it('throws on unclosed comment', () => {
            expect( () => parse('\n/*\n ') ).to.throw(/:2:1: Unclosed comment/);
        });

        it('throws on unclosed quote', () => {
            expect( () => parse('\n"\n\na ') ).to.throw(/:2:1: Unclosed quote/);
        });

        it('throws on unclosed bracket', () => {
            expect( () => parse(':not(one() { }') )
                .to.throw(/:1:5: Unclosed bracket/);
        });

        it('throws on property without value', () => {
            expect( () => parse('a { b;}')   ).to.throw(/:1:5: Unknown word/);
            expect( () => parse('a { b b }') ).to.throw(/:1:5: Unknown word/);
        });

        it('throws on nameless at-rule', () => {
            expect( () => parse('@') ).to.throw(/:1:1: At-rule without name/);
        });

        it('throws on property without semicolon', () => {
            expect( () => parse('a { one: 1 two: 2 }') )
                .to.throw(/:1:10: Missed semicolon/);
        });

        it('throws on double colon', () => {
            expect( () => parse('a { one:: 1 }') )
                .to.throw(/:1:9: Double colon/);
        });

    });

});
