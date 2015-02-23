import Declaration from '../lib/declaration';
import Container   from '../lib/container';
import parse       from '../lib/parse';
import Rule        from '../lib/rule';
import Root        from '../lib/root';

import { expect } from 'chai';

var example = 'a { a: 1; b: 2 }' +
              '/* a */' +
              '@keyframes anim {' +
                  '/* b */' +
                  'to { c: 3 }' +
              '}' +
              '@media all and (min-width: 100) {' +
                  'em { d: 4 }' +
                  '@page {' +
                       'e: 5;' +
                      '/* c */' +
                  '}' +
              '}';

describe('Container', () => {

    describe('push()', () => {

        it('adds child without checks', () => {
            var rule = parse('a { a: 1; b: 2 }').first;
            rule.push(new Declaration({ prop: 'c', value: '3' }));
            expect(rule.toString()).to.eql('a { a: 1; b: 2; c: 3 }');
            expect(rule.nodes.length).to.eql(3);
            expect(rule.last).to.not.have.property('before');
        });

    });

    describe('each()', () => {

        it('iterates', () => {
            var rule    = parse('a { a: 1; b: 2 }').first;
            var indexes = [];

            var result = rule.each( (decl, i) => {
                indexes.push(i);
                expect(decl).to.eql(rule.nodes[i]);
            });

            expect(result).to.not.exist;
            expect(indexes).to.eql([0, 1]);
        });

        it('iterates with prepend', () => {
            var rule = parse('a { a: 1; b: 2 }').first;
            var size = 0;

            rule.each( () => {
                rule.prepend({ prop: 'color', value: 'aqua' });
                size += 1;
            });

            expect(size).to.eql(2);
        });

        it('iterates with prepend insertBefore', () => {
            var rule = parse('a { a: 1; b: 2 }').first;
            var size = 0;

            rule.each( (decl) => {
                if ( decl.prop == 'a' ) {
                    rule.insertBefore(decl, { prop: 'c', value: '3' });
                }
                size += 1;
            });

            expect(size).to.eql(2);
        });

        it('iterates with append insertBefore', () => {
            var rule = parse('a { a: 1; b: 2 }').first;
            var size = 0;

            rule.each( (decl, i) => {
                if ( decl.prop == 'a' ) {
                    rule.insertBefore(i + 1, { prop: 'c', value: '3' });
                }
                size += 1;
            });

            expect(size).to.eql(3);
        });

        it('iterates with prepend insertAfter', () => {
            var rule = parse('a { a: 1; b: 2 }').first;
            var size = 0;

            rule.each( (decl, i) => {
                rule.insertAfter(i - 1, { prop: 'c', value: '3' });
                size += 1;
            });

            expect(size).to.eql(2);
        });

        it('iterates with append insertAfter', () => {
            var rule = parse('a { a: 1; b: 2 }').first;
            var size = 0;

            rule.each( (decl, i) => {
                if ( decl.prop == 'a' ) {
                    rule.insertAfter(i, { prop: 'c', value: '3' });
                }
                size += 1;
            });

            expect(size).to.eql(3);
        });

        it('iterates with remove', () => {
            var rule = parse('a { a: 1; b: 2 }').first;
            var size = 0;

            rule.each( () => {
                rule.remove(0);
                size += 1;
            });

            expect(size).to.eql(2);
        });

        it('breaks iteration', () => {
            var rule    = parse('a { a: 1; b: 2 }').first;
            var indexes = [];

            var result = rule.each( (decl, i) => {
                indexes.push(i);
                return false;
            });

            expect(result).to.be.false;
            expect(indexes).to.eql([0]);
        });

        it('allows to change children', () => {
            var rule  = parse('a { a: 1; b: 2 }').first;
            var props = [];

            var result = rule.each( (decl, i) => {
                props.push(decl.prop);
                rule.nodes = [rule.last, rule.first];
            });

            expect(props).to.eql(['a', 'a']);
        });

    });

    describe('eachInside()', () => {

        it('iterates', () => {
            var types   = [];
            var indexes = [];

            var result = parse(example).eachInside( (node, i) => {
                types.push(node.type);
                indexes.push(i);
            });

            expect(result).to.not.exist;
            expect(types).to.eql(['rule', 'decl', 'decl', 'comment', 'atrule',
                                  'comment', 'rule', 'decl', 'atrule', 'rule',
                                  'decl', 'atrule', 'decl', 'comment']);
            expect(indexes).to.eql([0, 0, 1, 1, 2, 0, 1, 0, 3, 0, 0, 1, 0, 1]);
        });

        it('breaks iteration', () => {
            var indexes = [];

            var result = parse(example).eachInside( (decl, i) => {
                indexes.push(i);
                return false;
            });

            expect(result).to.be.false;
            expect(indexes).to.eql([0]);
        });

    });

    describe('eachDecl()', () => {

        it('iterates', () => {
            var props   = [];
            var indexes = [];

            var result = parse(example).eachDecl( (decl, i) => {
                props.push(decl.prop);
                indexes.push(i);
            });

            expect(result).to.not.exist;
            expect(props).to.eql(['a', 'b', 'c', 'd', 'e']);
            expect(indexes).to.eql([0, 1, 0, 0, 0]);
        });

        it('iterates with changes', () => {
            var size = 0;
            parse(example).eachDecl( (decl, i) => {
                decl.parent.remove(i);
                size += 1;
            });
            expect(size).to.eql(5);
        });

        it('breaks iteration', () => {
            var indexes = [];

            var result = parse(example).eachDecl( (decl, i) => {
                indexes.push(i);
                return false;
            });

            expect(result).to.be.false;
            expect(indexes).to.eql([0]);
        });

        it('filters declarations by property name', () => {
            var css  = parse('@page{a{one:1}}b{one:1;two:2}');
            var size = 0;

            css.eachDecl('one', (decl) => {
                expect(decl.prop).to.eql('one');
                size += 1;
            });

            expect(size).to.eql(2);
        });

        it('filters declarations by property regexp', () => {
            var css  = parse('@page{a{one:1}}b{one-x:1;two:2}');
            var size = 0;

            css.eachDecl(/one(-x)?/, () => size += 1 );

            expect(size).to.eql(2);
        });

    });

    describe('eachComment()', () => {

        it('iterates', () => {
            var texts   = [];
            var indexes = [];

            var result = parse(example).eachComment( (comment, i) => {
                texts.push(comment.text);
                indexes.push(i);
            });

            expect(result).to.not.exist;
            expect(texts).to.eql(  ['a', 'b', 'c']);
            expect(indexes).to.eql([1, 0, 1]);
        });

        it('iterates with changes', () => {
            var size = 0;
            parse(example).eachComment( (comment, i) => {
                comment.parent.remove(i);
                size += 1;
            });
            expect(size).to.eql(3);
        });

        it('breaks iteration', () => {
            var indexes = [];

            var result = parse(example).eachComment( (comment, i) => {
                indexes.push(i);
                return false;
            });

            expect(result).to.be.false;
            expect(indexes).to.eql([1]);
        });

    });

    describe('eachRule()', () => {

        it('iterates', () => {
            var selectors = [];
            var indexes   = [];

            var result = parse(example).eachRule( (rule, i) => {
                selectors.push(rule.selector);
                indexes.push(i);
            });

            expect(result).to.not.exist;
            expect(selectors).to.eql(['a', 'to', 'em']);
            expect(indexes).to.eql([0, 1, 0]);
        });

        it('iterates with changes', () => {
            var size = 0;
            parse(example).eachRule( (rule, i) => {
                rule.parent.remove(i);
                size += 1;
            });
            expect(size).to.eql(3);
        });

        it('breaks iteration', () => {
            var indexes = [];

            var result = parse(example).eachRule( (rule, i) => {
                indexes.push(i);
                return false;
            });

            expect(result).to.be.false;
            expect(indexes).to.eql([0]);
        });

    });

    describe('eachAtRule()', () => {

        it('iterates', () => {
            var names   = [];
            var indexes = [];

            var result = parse(example).eachAtRule( (atrule, i) => {
                names.push(atrule.name);
                indexes.push(i);
            });

            expect(result).to.not.exist;
            expect(names).to.eql(['keyframes', 'media', 'page']);
            expect(indexes).to.eql([2, 3, 1]);
        });

        it('iterates with changes', () => {
            var size = 0;
            parse(example).eachAtRule( (atrule, i) => {
                atrule.parent.remove(i);
                size += 1;
            });
            expect(size).to.eql(3);
        });

        it('breaks iteration', () => {
            var indexes = [];

            var result = parse(example).eachAtRule( (atrule, i) => {
                indexes.push(i);
                return false;
            });

            expect(result).to.be.false;
            expect(indexes).to.eql([2]);
        });

        it('filters at-rules by name', () => {
            var css  = parse('@page{@page 2{}}@media print{@page{}}');
            var size = 0;

            css.eachAtRule('page', (atrule) => {
                expect(atrule.name).to.eql('page');
                size += 1;
            });

            expect(size).to.eql(3);
        });

        it('filters at-rules by name regexp', () => {
            var css  = parse('@page{@page 2{}}@media print{@page{}}');
            var size = 0;

            css.eachAtRule(/page/, () => size += 1 );

            expect(size).to.eql(3);
        });

    });

    describe('append()', () => {

        it('appends child', () => {
            var rule = parse('a { a: 1; b: 2 }').first;
            rule.append({ prop: 'c', value: '3' });
            expect(rule.toString()).to.eql('a { a: 1; b: 2; c: 3 }');
            expect(rule.last.before).to.eql(' ');
        });

        it('has declaration shortcut', () => {
            var rule = parse('a { a: 1; b: 2 }').first;
            rule.append({ prop: 'c', value: '3' });
            expect(rule.toString()).to.eql('a { a: 1; b: 2; c: 3 }');
        });

        it('has rule shortcut', () => {
            var root = new Root();
            root.append({ selector: 'a' });
            expect(root.first.toString()).to.eql('a {}');
        });

        it('has at-rule shortcut', () => {
            var root = new Root();
            root.append({ name: 'encoding', params: '"utf-8"' });
            expect(root.first.toString()).to.eql('@encoding "utf-8"');
        });

        it('has comment shortcut', () => {
            var root = new Root();
            root.append({ text: 'ok' });
            expect(root.first.toString()).to.eql('/* ok */');
        });

        it('receives root', () => {
            var css = parse('a {}');
            css.append( parse('b {}') );
            expect(css.toString()).to.eql('a {}\nb {}');
        });

        it('reveives string', () => {
            var root = new Root();
            root.append('a{}b{}');
            root.first.append('color:black');
            expect(root.toString()).to.eql('a {\n    color: black\n}\nb {}');
        });

        it('receives array', () => {
            var a = parse('a{ z-index: 1 }');
            var b = parse('b{width:1px;height:2px}');

            a.first.append( b.first.nodes );
            expect(a.toString()).to.eql(
                'a{ z-index: 1; width: 1px; height: 2px }');
            expect(b.toString()).to.eql('b{width:1px;height:2px}');
        });

        it('clones node on insert', () => {
            var a = parse('a{}');
            var b = parse('b{}');

            b.append(a.first);
            b.last.selector = 'b a';

            expect(a.toString()).to.eql('a{}');
            expect(b.toString()).to.eql('b{}\nb a{}');
        });

    });

    describe('prepend()', () => {

        it('prepends child', () => {
            var rule = parse('a { a: 1; b: 2 }').first;
            rule.prepend({ prop: 'c', value: '3' });
            expect(rule.toString()).to.eql('a { c: 3; a: 1; b: 2 }');
            expect(rule.first.before).to.eql(' ');
        });

        it('receive hash instead of declaration', () => {
            var rule = parse('a { a: 1; b: 2 }').first;
            rule.prepend({ prop: 'c', value: '3' });
            expect(rule.toString()).to.eql('a { c: 3; a: 1; b: 2 }');
        });

        it('receives root', () => {
            var css = parse('a {}');
            css.prepend( parse('b {}') );
            expect(css.toString()).to.eql('b {}\na {}');
        });

        it('receives root', () => {
            var css = parse('a {}');
            css.prepend('b {}');
            expect(css.toString()).to.eql('b {}\na {}');
        });

        it('receives array', () => {
            var a = parse('a{ z-index: 1 }');
            var b = parse('b{width:1px;height:2px}');

            a.first.prepend( b.first.nodes );
            expect(a.toString()).to.eql(
                'a{ width: 1px; height: 2px; z-index: 1 }');
        });

        it('works on empty container', () => {
            var root = parse('');
            root.prepend( new Rule({ selector: 'a' }) );
            expect(root.toString()).to.eql('a {}');
        });

    });

    describe('insertBefore()', () => {

        it('inserts child', () => {
            var rule = parse('a { a: 1; b: 2 }').first;
            rule.insertBefore(1, { prop: 'c', value: '3' });
            expect(rule.toString()).to.eql('a { a: 1; c: 3; b: 2 }');
            expect(rule.nodes[1].before).to.eql(' ');
        });

        it('works with nodes too', () => {
            var rule = parse('a { a: 1; b: 2 }').first;
            rule.insertBefore(rule.nodes[1], { prop: 'c', value: '3' });
            expect(rule.toString()).to.eql('a { a: 1; c: 3; b: 2 }');
        });

        it('receive hash instead of declaration', () => {
            var rule = parse('a { a: 1; b: 2 }').first;
            rule.insertBefore(1, { prop: 'c', value: '3' });
            expect(rule.toString()).to.eql('a { a: 1; c: 3; b: 2 }');
        });

        it('receives array', () => {
            var a = parse('a{ color: red; z-index: 1 }');
            var b = parse('b{width:1;height:2}');

            a.first.insertBefore(1, b.first.nodes);
            expect(a.toString()).to.eql(
                'a{ color: red; width: 1; height: 2; z-index: 1 }');
        });

    });

    describe('insertAfter()', () => {

        it('inserts child', () => {
            var rule = parse('a { a: 1; b: 2 }').first;
            rule.insertAfter(0, { prop: 'c', value: '3' });
            expect(rule.toString()).to.eql('a { a: 1; c: 3; b: 2 }');
            expect(rule.nodes[1].before).to.eql(' ');
        });

        it('works with nodes too', () => {
            var rule = parse('a { a: 1; b: 2 }').first;
            rule.insertAfter(rule.first, { prop: 'c', value: '3' });
            expect(rule.toString()).to.eql('a { a: 1; c: 3; b: 2 }');
        });

        it('receive hash instead of declaration', () => {
            var rule = parse('a { a: 1; b: 2 }').first;
            rule.insertAfter(0, { prop: 'c', value: '3' });
            expect(rule.toString()).to.eql('a { a: 1; c: 3; b: 2 }');
        });

        it('receives array', () => {
            var a = parse('a{ color: red; z-index: 1 }');
            var b = parse('b{width:1;height:2}');

            a.first.insertAfter(0, b.first.nodes);
            expect(a.toString()).to.eql(
                'a{ color: red; width: 1; height: 2; z-index: 1 }');
        });

    });

    describe('remove()', () => {

        it('removes by index', () => {
            var rule = parse('a { a: 1; b: 2 }').first;
            rule.remove(1);
            expect(rule.toString()).to.eql('a { a: 1 }');
        });

        it('removes by node', () => {
            var rule = parse('a { a: 1; b: 2 }').first;
            rule.remove(rule.last);
            expect(rule.toString()).to.eql('a { a: 1 }');
        });

        it('cleans parent in removed node', () => {
            var rule = parse('a { a: 1; b: 2 }').first;
            var decl = rule.first;
            rule.remove(decl);
            expect(decl.parent).to.not.exist;
        });

    });

    describe('removeAll()', () => {

        it('removes all children', () => {
            var rule = parse('a { a: 1; b: 2 }').first;
            var decl = rule.first;
            rule.removeAll();

            expect(decl.parent).to.not.exist;
            expect(rule.toString()).to.eql('a { }');
        });

    });

    describe('replaceValues()', () => {

        it('replaces strings', () => {
            var css    = parse('a{one:1}b{two:1 2}');
            var result = css.replaceValues('1', 'A');

            expect(result).to.eql(css);
            expect(css.toString()).to.eql('a{one:A}b{two:A 2}');
        });

        it('replaces regpexp', () => {
            var css = parse('a{one:1}b{two:1 2}');
            css.replaceValues(/\d/g, i => i + 'A');
            expect(css.toString()).to.eql('a{one:1A}b{two:1A 2A}');
        });

        it('filters properties', () => {
            var css = parse('a{one:1}b{two:1 2}');
            css.replaceValues('1', { props: ['one'] }, 'A');
            expect(css.toString()).to.eql('a{one:A}b{two:1 2}');
        });

        it('uses fast check', () => {
            var css = parse('a{one:1}b{two:1 2}');
            css.replaceValues('1', { fast: '2' }, 'A');
            expect(css.toString()).to.eql('a{one:1}b{two:A 2}');
        });

    });

    describe('any()', () => {

        it('return true if all children return true', () => {
            var rule = parse('a { a: 1; b: 2 }').first;
            expect(rule.every( i => i.prop.match(/a|b/) )).to.be.true;
            expect(rule.every( i => i.prop.match(/b/)   )).to.be.false;
        });

    });

    describe('some()', () => {

        it('return true if all children return true', () => {
            var rule = parse('a { a: 1; b: 2 }').first;
            expect(rule.some( i => i.prop == 'b' )).to.be.true;
            expect(rule.some( i => i.prop == 'c' )).to.be.false;
        });

    });

    describe('index()', () => {

        it('returns child index', () => {
            var rule = parse('a { a: 1; b: 2 }').first;
            expect(rule.index( rule.nodes[1] )).to.eql(1);
        });

        it('returns argument if it(is number', () => {
            var rule = parse('a { a: 1; b: 2 }').first;
            expect(rule.index(2)).to.eql(2);
        });

    });

    describe('first', () => {

        it('returns first child', () => {
            var rule = parse('a { a: 1; b: 2 }').first;
            expect(rule.first.prop).to.eql('a');
        });

    });

    describe('last', () => {

        it('returns last child', () => {
            var rule = parse('a { a: 1; b: 2 }').first;
            expect(rule.last.prop).to.eql('b');
        });

    });

    describe('normalize()', () => {

        it("doesn't normalize new children with exists before", () => {
            var rule = parse('a { a: 1; b: 2 }').first;
            rule.append({ prop: 'c', value: '3', before: '\n ' });
            expect(rule.toString()).to.eql('a { a: 1; b: 2;\n c: 3 }');
        });

    });

});
