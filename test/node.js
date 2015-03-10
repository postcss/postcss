import CssSyntaxError from '../lib/css-syntax-error';
import Declaration    from '../lib/declaration';
import AtRule         from '../lib/at-rule';
import parse          from '../lib/parse';
import Node           from '../lib/node';
import Root           from '../lib/root';
import Rule           from '../lib/rule';

import { expect } from 'chai';

describe('Node', () => {

    describe('error()', () => {

        it('generates custom error', () => {
            let css   = parse('a{}', { from: '/a.css' });
            let error = css.first.error('Test');
            expect(error).to.be.instanceOf(CssSyntaxError);
            expect(error.message).to.eql('/a.css:1:1: Test');
        });

        it('generates custom error for nodes without source', () => {
            let rule  = new Rule({ selector: 'a' });
            let error = rule.error('Test');
            expect(error.message).to.eql('<css input>: Test');
        });

    });

    describe('removeSelf()', () => {

        it('removes node from parent', () => {
            let rule = new Rule({ selector: 'a' });
            let decl = new Declaration({ prop: 'color', value: 'black' });
            rule.append(decl);

            decl.removeSelf();
            expect(rule.nodes).to.be.empty;
            expect(decl.parent).to.not.exist;
        });

    });

    describe('replace()', () => {

        it('inserts new node', () => {
            let rule = new Rule({ selector: 'a' });
            rule.append({ prop: 'color', value: 'black' });
            rule.append({ prop: 'width', value: '1px' });
            rule.append({ prop: 'height', value: '1px' });

            let node   = new Declaration({ prop: 'min-width', value: '1px' });
            let width  = rule.nodes[1];
            let result = width.replace(node);

            expect(result).to.eql(width);

            expect(rule.toString()).to.eql('a {\n' +
                                       '    color: black;\n' +
                                       '    min-width: 1px;\n' +
                                       '    height: 1px\n' +
                                       '}');
        });

        it('inserts new root', () => {
            let root = new Root();
            root.append( new AtRule({ name: 'import', params: '"a.css"' }) );

            let a = new Root();
            a.append( new Rule({ selector: 'a' }) );
            a.append( new Rule({ selector: 'b' }) );

            root.first.replace(a);
            expect(root.toString()).to.eql('a {}\nb {}');
        });

    });

    describe('clone()', () => {

        it('clones nodes', () => {
            let rule = new Rule({ selector: 'a', after: '' });
            rule.append({ prop: 'color', value: '/**/black', before: '' });

            let clone = rule.clone();

            expect(clone.parent).to.not.exist;

            expect(rule.first.parent).to.equal(rule);
            expect(clone.first.parent).to.equal(clone);

            clone.append({ prop: 'z-index', value: '1' });
            expect(rule.nodes.length).to.equal(1);
        });

        it('overrides properties', () => {
            let rule  = new Rule({ selector: 'a' });
            let clone = rule.clone({ selector: 'b' });
            expect(clone.selector).to.eql('b');
        });

        it('cleans code style', () => {
            let css = parse('@page 1{a{color:black;}}');
            expect(css.clone().toString()).to.eql('@page 1 {\n' +
                                                  '    a {\n' +
                                                  '        color: black\n' +
                                                  '    }\n' +
                                                  '}');
        });

    });

    describe('cloneBefore()', () => {

        it('clones and insert before current node', () => {
            let rule = new Rule({ selector: 'a', after: '' });
            rule.append({ prop: 'z-index', value: '1', before: '' });

            let result = rule.first.cloneBefore({ value: '2' });

            expect(result).to.equal(rule.first);
            expect(rule.toString()).to.eql('a {z-index: 2;z-index: 1}');
        });

    });

    describe('cloneAfter()', () => {

        it('clones and insert after current node', () => {
            let rule = new Rule({ selector: 'a', after: '' });
            rule.append({ prop: 'z-index', value: '1', before: '' });

            let result = rule.first.cloneAfter({ value: '2' });

            expect(result).to.equal(rule.last);
            expect(rule.toString()).to.eql('a {z-index: 1;z-index: 2}');
        });

    });

    describe('next()', () => {

        it('returns next node', () => {
            let css = parse('a{one:1;two:2}');
            expect(css.first.first.next()).to.equal(css.first.last);
            expect(css.first.last.next()).to.not.exist;
        });

    });

    describe('prev()', () => {

        it('returns previous node', () => {
            let css = parse('a{one:1;two:2}');
            expect(css.first.last.prev()).to.equal(css.first.first);
            expect(css.first.first.prev()).to.not.exist;
        });

    });

    describe('replaceWith()', () => {

        it('replaces node', () => {
            let css    = parse('a{one:1;two:2}');
            let decl   = { prop: 'fix', value: 'fixed' };
            let result = css.first.first.replaceWith(decl);

            expect(result.prop).to.eql('one');
            expect(result.parent).to.not.exist;
            expect(css.toString()).to.eql('a{fix:fixed;two:2}');
        });

    });

    describe('moveTo()', () => {

        it('moves node between roots', () => {
            let css1 = parse('a{one:1}b{two:2}');
            let css2 = parse('c {\n thr: 3\n}');
            css1.first.moveTo(css2);

            expect(css1.toString()).to.eql('b{two:2}');
            expect(css2.toString()).to.eql('c {\n thr: 3\n}\na {\n one: 1\n}');
        });

        it('moves node inside one root', () => {
            let css = parse('a{\n one:1}\n@page {\n b {\n  two: 2\n }\n}');
            css.first.moveTo(css.last);

            expect(css.toString())
                .to.eql('@page {\n b {\n  two: 2\n }\n a{\n  one:1\n }\n}');
        });

    });

    describe('moveBefore()', () => {

        it('moves node between roots', () => {
            let css1 = parse('a{one:1}b{two:2}');
            let css2 = parse('c {\n thr: 3\n}');
            css1.first.moveBefore(css2.first);

            expect(css1.toString()).to.eql('b{two:2}');
            expect(css2.toString()).to.eql('a {\n one: 1\n}\nc {\n thr: 3\n}');
        });

        it('moves node inside one root', () => {
            let css = parse('a{\n one:1}\n@page {\n b {\n  two: 2\n }\n}');
            css.first.moveBefore(css.last.first);

            expect(css.toString())
                .to.eql('@page {\n a{\n  one:1\n }\n b {\n  two: 2\n }\n}');
        });

    });

    describe('moveAfter()', () => {

        it('moves node between roots', () => {
            let css1 = parse('a{one:1}b{two:2}');
            let css2 = parse('c {\n thr: 3\n}');
            css1.first.moveAfter(css2.first);

            expect(css1.toString()).to.eql('b{two:2}');
            expect(css2.toString()).to.eql('c {\n thr: 3\n}\na {\n one: 1\n}');
        });

        it('moves node inside one root', () => {
            let css = parse('a{\n one:1}\n@page {\n b {\n  two: 2\n }\n}');
            css.first.moveAfter(css.last.first);

            expect(css.toString())
                .to.eql('@page {\n b {\n  two: 2\n }\n a{\n  one:1\n }\n}');
        });

    });

    describe('toJSON()', () => {

        it('cleans parents inside', () => {
            let rule = new Rule({ selector: 'a' });
            rule.append({ prop: 'color', value: 'b' });

            let json = rule.toJSON();
            expect(json.parent).to.not.exist;
            expect(json.nodes[0].parent).to.not.exist;

            expect(JSON.stringify(rule)).to.eql(
                '{"type":"rule","nodes":[' +
                    '{"type":"decl","prop":"color","value":"b"}' +
                '],"selector":"a"}');
        });

    });

    describe('style()', () => {

        it('uses node style', () => {
            let rule = new Rule({ selector: 'a', between: '\n' });
            expect(rule.style('between', 'beforeOpen')).to.eql('\n');
        });

        it('hacks before for nodes without parent', () => {
            let rule = new Rule({ selector: 'a' });
            expect(rule.style('before')).to.eql('');
        });

        it('hacks before for first node', () => {
            let root = new Root();
            root.append(new Rule({ selector: 'a' }));
            expect(root.first.style('before')).to.eql('');
        });

        it('hacks before for first decl', () => {
            let decl = new Declaration({ prop: 'color', value: 'black' });
            expect(decl.style('before')).to.eql('');

            let rule = new Rule({ selector: 'a' });
            rule.append(decl);
            expect(decl.style('before')).to.eql('\n    ');
        });

        it('detects after style', () => {
            let root = new Root();
            root.append({ selector: 'a', after: ' ' });
            root.first.append({ prop: 'color', value: 'black' });
            root.append({ selector: 'a' });
            expect(root.last.style('after')).to.eql(' ');
        });

        it('uses defaults without parent', () => {
            let rule = new Rule({ selector: 'a' });
            expect(rule.style('between', 'beforeOpen')).to.eql(' ');
        });

        it('uses defaults for unique node', () => {
            let root = new Root();
            root.append(new Rule({ selector: 'a' }));
            expect(root.first.style('between', 'beforeOpen')).to.eql(' ');
        });

        it('clones style from first node', () => {
            let root = new Root();
            root.append( new Rule({ selector: 'a', between: '' }) );
            root.append( new Rule({ selector: 'b' }) );

            expect(root.last.style('between', 'beforeOpen')).to.eql('');
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
            expect(css.first.style('semicolon')).to.be.true;
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

    describe('root()', () => {

        it('returns root', () => {
            let css = parse('@page{a{color:black}}');
            expect(css.first.first.first.root()).to.equal(css);
        });

        it('returns parent of parents', () => {
            let rule = new Rule({ selector: 'a' });
            rule.append({ prop: 'color', value: 'black' });
            expect(rule.first.root()).to.equal(rule);
        });

        it('returns self on root', () => {
            let rule = new Rule({ selector: 'a' });
            expect(rule.root()).to.equal(rule);
        });

    });

    describe('cleanStyles()', () => {

        it('cleans style recursivelly', () => {
            let css = parse('@page{a{color:black}}');
            css.cleanStyles();

            expect(css.toString())
                .to.eql('@page {\n    a {\n        color: black\n    }\n}');
            expect(css.first.before).to.not.exist;
            expect(css.first.first.firstbefore).to.not.exist;
            expect(css.first.between).to.not.exist;
            expect(css.first.first.first.between).to.not.exist;
            expect(css.first.after).to.not.exist;
        });

        it('keeps between on request', () => {
            let css = parse('@page{a{color:black}}');
            css.cleanStyles(true);

            expect(css.toString())
                .to.eql('@page{\n    a{\n        color:black\n    }\n}');
            expect(css.first.before).to.not.exist;
            expect(css.first.first.firstbefore).to.not.exist;
            expect(css.first.between).to.exist;
            expect(css.first.first.first.between).to.exist;
            expect(css.first.after).to.not.exist;
        });

    });

    describe('stringifyRaw()', () => {
        it('creates trimmed/raw property', () => {
            let b = new Node({
                one: 'trim',
                _one: { value: 'trim', raw: 'raw' }
            });
            expect(b.stringifyRaw('one')).to.eql('raw');

            b.one = 'trim1';
            expect(b.stringifyRaw('one')).to.eql('trim1');
        });

        it('works without magic', () => {
            let b = new Node();
            b.one = '1';
            expect(b.one).to.eql('1');
            expect(b.stringifyRaw('one')).to.eql('1');
        });

    });

});
