import Stringifier from '../lib/stringifier';
import Declaration from '../lib/declaration';
import AtRule      from '../lib/at-rule';
import parse       from '../lib/parse';
import Node        from '../lib/node';
import Root        from '../lib/root';
import Rule        from '../lib/rule';

import { expect } from 'chai';
import   path     from 'path';
import   fs       from 'fs';

describe('stringifier', () => {
    let str;
    before( () => {
        str = new Stringifier();
    });

    describe('.stringify()', () => {

        fs.readdirSync(path.join(__dirname, 'cases')).forEach( name => {
            if ( !name.match(/\.css$/) ) return;

            it('stringify ' + name, () => {
                let file = path.join(__dirname, 'cases', name);
                let css  = fs.readFileSync(file).toString();
                let root = parse(css, { from: file });
                expect(root.toString()).to.eql(css);
            });
        });

    });

    describe('.raw()', () => {

        it('creates trimmed/raw property', () => {
            let b = new Node({ one: 'trim' });
            b.raw.one = { value: 'trim', raw: 'raw' };
            expect(str.raw(b, 'one')).to.eql('raw');

            b.one = 'trim1';
            expect(str.raw(b, 'one')).to.eql('trim1');
        });

        it('works without magic', () => {
            let b = new Node();
            b.one = '1';
            expect(b.one).to.eql('1');
            expect(str.raw(b, 'one')).to.eql('1');
        });
    });

    describe('style()', () => {

        it('uses node style', () => {
            let rule = new Rule({ selector: 'a', raw: { between: '\n' } });
            expect(str.style(rule, 'between', 'beforeOpen')).to.eql('\n');
        });

        it('hacks before for nodes without parent', () => {
            let rule = new Rule({ selector: 'a' });
            expect(str.style(rule, 'before')).to.eql('');
        });

        it('hacks before for first node', () => {
            let root = new Root();
            root.append(new Rule({ selector: 'a' }));
            expect(str.style(root.first, 'before')).to.eql('');
        });

        it('hacks before for first decl', () => {
            let decl = new Declaration({ prop: 'color', value: 'black' });
            expect(str.style(decl, 'before')).to.eql('');

            let rule = new Rule({ selector: 'a' });
            rule.append(decl);
            expect(str.style(decl, 'before')).to.eql('\n    ');
        });

        it('detects after style', () => {
            let root = new Root();
            root.append({ selector: 'a', raw: { after: ' ' } });
            root.first.append({ prop: 'color', value: 'black' });
            root.append({ selector: 'a' });
            expect(str.style(root.last, 'after')).to.eql(' ');
        });

        it('uses defaults without parent', () => {
            let rule = new Rule({ selector: 'a' });
            expect(str.style(rule, 'between', 'beforeOpen')).to.eql(' ');
        });

        it('uses defaults for unique node', () => {
            let root = new Root();
            root.append(new Rule({ selector: 'a' }));
            expect(str.style(root.first, 'between', 'beforeOpen')).to.eql(' ');
        });

        it('clones style from first node', () => {
            let root = new Root();
            root.append( new Rule({ selector: 'a', raw: { between: '' } }) );
            root.append( new Rule({ selector: 'b' }) );

            expect(str.style(root.last, 'between', 'beforeOpen')).to.eql('');
        });

        it('indents by default', () => {
            let root = new Root();
            root.append( new AtRule({ name: 'page' }) );
            root.first.append( new Rule({ selector: 'a' }) );
            root.first.first.append({ prop: 'color', value: 'black' });

            expect(root.toString()).to.eql('@page {\n' +
                                           '    a {\n' +
                                           '        color: black\n' +
                                           '    }\n' +
                                           '}');
        });

        it('clones indent', () => {
            let compress = parse('@page{ a{ } }');
            let spaces   = parse('@page {\n  a {\n  }\n}');

            compress.first.first.append({ prop: 'color', value: 'black' });
            expect(compress.toString()).to.eql('@page{ a{ color: black } }');

            spaces.first.first.append({ prop: 'color', value: 'black' });
            expect(spaces.toString())
                .to.eql('@page {\n  a {\n    color: black\n  }\n}');
        });

        it('clones indent by types', () => {
            let css = parse('a {\n  color: black\n}\n\nb {\n}');
            css.append(new Rule({ selector: 'em' }));
            css.last.append({ prop: 'z-index', value: '1' });

            expect(css.last.toString()).to.eql('\n\nem {\n  z-index: 1\n}');
        });

        it('clones indent by before and after', () => {
            let css = parse('@page{\n\n a{\n  color: black}}');
            css.first.append(new Rule({ selector: 'b' }));
            css.first.last.append({ prop: 'z-index', value: '1' });

            expect(css.first.last.toString()).to.eql('\n\n b{\n  z-index: 1}');
        });

        it('clones semicolon only from rules with children', () => {
            let css = parse('a{}b{one:1;}');
            expect(str.style(css.first, 'semicolon')).to.be.true;
        });

        it('clones only spaces in before', () => {
            let css = parse('a{*one:1}');
            css.first.append({ prop: 'two', value: '2' });
            css.append({ name: 'keyframes', params: 'a' });
            css.last.append({ selector: 'from'});
            expect(css.toString())
                .to.eql('a{*one:1;two:2}\n@keyframes a{\nfrom{}}');
        });

        it('clones only spaces in between', () => {
            let css = parse('a{one/**/:1}');
            css.first.append({ prop: 'two', value: '2' });
            expect(css.toString()).to.eql('a{one/**/:1;two:2}');
        });

    });

});
