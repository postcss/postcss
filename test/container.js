var Declaration = require('../lib/declaration');
var Container   = require('../lib/container');
var parse       = require('../lib/parse');
var Rule        = require('../lib/rule');
var Root        = require('../lib/root');

var expect = require('chai').expect;

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
    beforeEach( () => {
        this.big  = parse(example);
        this.rule = parse('a { a: 1; b: 2 }').first;
        this.new  = new Declaration({ prop: 'c', value: '3' });
    });

    describe('push()', () => {

        it('adds child without checks', () => {
            this.rule.push(this.new);
            expect(this.rule.toString()).to.eql('a { a: 1; b: 2; c: 3 }');
            expect(this.rule.nodes.length).to.eql(3);
            expect(this.rule.last).to.not.have.property('before');
        });

    });

    describe('each()', () => {

        it('iterates', () => {
            var indexes = [];

            var result = this.rule.each( (decl, i) => {
                indexes.push(i);
                expect(decl).to.eql(this.rule.nodes[i]);
            });

            expect(result).to.not.exist();
            expect(indexes).to.eql([0, 1]);
        });

        it('iterates with prepend', () => {
            var size = 0;
            this.rule.each( () => {
                this.rule.prepend({ prop: 'color', value: 'aqua' });
                size += 1;
            });
            expect(size).to.eql(2);
        });

        it('iterates with prepend insertBefore', () => {
            var size = 0;
            this.rule.each( (decl) => {
                if ( decl.prop == 'a' ) {
                    this.rule.insertBefore(decl, { prop: 'c', value: '3' });
                }
                size += 1;
            });
            expect(size).to.eql(2);
        });

        it('iterates with append insertBefore', () => {
            var size = 0;
            this.rule.each( (decl, i) => {
                if ( decl.prop == 'a' ) {
                    this.rule.insertBefore(i + 1, { prop: 'c', value: '3' });
                }
                size += 1;
            });
            expect(size).to.eql(3);
        });

        it('iterates with prepend insertAfter', () => {
            var size = 0;
            this.rule.each( (decl, i) => {
                this.rule.insertAfter(i - 1, { prop: 'c', value: '3' });
                size += 1;
            });
            expect(size).to.eql(2);
        });

        it('iterates with append insertAfter', () => {
            var size = 0;
            this.rule.each( (decl, i) => {
                if ( decl.prop == 'a' ) {
                    this.rule.insertAfter(i, { prop: 'c', value: '3' });
                }
                size += 1;
            });
            expect(size).to.eql(3);
        });

        it('iterates with remove', () => {
            var size = 0;
            this.rule.each( () => {
                this.rule.remove(0);
                size += 1;
            });
            expect(size).to.eql(2);
        });

        it('breaks iteration', () => {
            var indexes = [];

            var result = this.rule.each( (decl, i) => {
                indexes.push(i);
                return false;
            });

            expect(result).to.be.false;
            expect(indexes).to.eql([0]);
        });

        it('allows to change children', () => {
            var props = [];
            var result = this.rule.each( (decl, i) => {
                props.push(decl.prop);
                this.rule.nodes = [this.rule.last, this.rule.first];
            });
            expect(props).to.eql(['a', 'a']);
        });

    });

    describe('eachInside()', () => {
        it('iterates', () => {
            var types   = [];
            var indexes = [];

            var result = this.big.eachInside( (node, i) => {
                types.push(node.type);
                indexes.push(i);
            });

            expect(result).to.not.exist();
            expect(types).to.eql(['rule', 'decl', 'decl', 'comment', 'atrule',
                                  'comment', 'rule', 'decl', 'atrule', 'rule',
                                  'decl', 'atrule', 'decl', 'comment']);
            expect(indexes).to.eql([0, 0, 1, 1, 2, 0, 1, 0, 3, 0, 0, 1, 0, 1]);
        });

        it('breaks iteration', () => {
            var indexes = [];

            var result = this.big.eachInside( (decl, i) => {
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

            var result = this.big.eachDecl( (decl, i) => {
                props.push(decl.prop);
                indexes.push(i);
            });

            expect(result).to.not.exist();
            expect(props).to.eql(['a', 'b', 'c', 'd', 'e']);
            expect(indexes).to.eql([0, 1, 0, 0, 0]);
        });

        it('iterates with changes', () => {
            var size = 0;
            this.big.eachDecl( (decl, i) => {
                decl.parent.remove(i);
                size += 1;
            });
            expect(size).to.eql(5);
        });

        it('breaks iteration', () => {
            var indexes = [];

            var result = this.big.eachDecl( (decl, i) => {
                indexes.push(i);
                return false;
            });

            expect(result).to.be.false;
            expect(indexes).to.eql([0]);
        });

    });

    describe('eachComment()', () => {

        it('iterates', () => {
            var texts   = [];
            var indexes = [];

            var result = this.big.eachComment( (comment, i) => {
                texts.push(comment.text);
                indexes.push(i);
            });

            expect(result).to.not.exist();
            expect(texts).to.eql(  ['a', 'b', 'c']);
            expect(indexes).to.eql([1, 0, 1]);
        });

        it('iterates with changes', () => {
            var size = 0;
            this.big.eachComment( (comment, i) => {
                comment.parent.remove(i);
                size += 1;
            });
            expect(size).to.eql(3);
        });

        it('breaks iteration', () => {
            var indexes = [];

            var result = this.big.eachComment( (comment, i) => {
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

            var result = this.big.eachRule( (rule, i) => {
                selectors.push(rule.selector);
                indexes.push(i);
            });

            expect(result).to.not.exist();
            expect(selectors).to.eql(['a', 'to', 'em']);
            expect(indexes).to.eql([0, 1, 0]);
        });

        it('iterates with changes', () => {
            var size = 0;
            this.big.eachRule( (rule, i) => {
                rule.parent.remove(i);
                size += 1;
            });
            expect(size).to.eql(3);
        });

        it('breaks iteration', () => {
            var indexes = [];

            var result = this.big.eachRule( (rule, i) => {
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

            var result = this.big.eachAtRule( (atrule, i) => {
                names.push(atrule.name);
                indexes.push(i);
            });

            expect(result).to.not.exist();
            expect(names).to.eql(['keyframes', 'media', 'page']);
            expect(indexes).to.eql([2, 3, 1]);
        });

        it('iterates with changes', () => {
            var size = 0;
            this.big.eachAtRule( (atrule, i) => {
                atrule.parent.remove(i);
                size += 1;
            });
            expect(size).to.eql(3);
        });

        it('breaks iteration', () => {
            var indexes = [];

            var result = this.big.eachAtRule( (atrule, i) => {
                indexes.push(i);
                return false;
            });

            expect(result).to.be.false;
            expect(indexes).to.eql([2]);
        });

    });

    describe('append()', () => {

        it('appends child', () => {
            this.rule.append(this.new);
            expect(this.rule.toString()).to.eql('a { a: 1; b: 2; c: 3 }');
            expect(this.rule.last.before).to.eql(' ');
        });

        it('has declaration shortcut', () => {
            this.rule.append({ prop: 'c', value: '3' });
            expect(this.rule.toString()).to.eql('a { a: 1; b: 2; c: 3 }');
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
            expect(css.toString()).to.eql('a {}b {}');
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
            expect(b.toString()).to.eql('b{}b a{}');
        });

    });

    describe('prepend()', () => {

        it('prepends child', () => {
            this.rule.prepend(this.new);
            expect(this.rule.toString()).to.eql('a { c: 3; a: 1; b: 2 }');
            expect(this.rule.first.before).to.eql(' ');
        });

        it('receive hash instead of declaration', () => {
            this.rule.prepend({ prop: 'c', value: '3' });
            expect(this.rule.toString()).to.eql('a { c: 3; a: 1; b: 2 }');
        });

        it('receives root', () => {
            var css = parse('a {}');
            css.prepend( parse('b {}') );
            expect(css.toString()).to.eql('b {}a {}');
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
            this.rule.insertBefore(1, this.new);
            expect(this.rule.toString()).to.eql('a { a: 1; c: 3; b: 2 }');
            expect(this.rule.nodes[1].before).to.eql(' ');
        });

        it('works with nodes too', () => {
            this.rule.insertBefore(this.rule.nodes[1], this.new);
            expect(this.rule.toString()).to.eql('a { a: 1; c: 3; b: 2 }');
        });

        it('receive hash instead of declaration', () => {
            this.rule.insertBefore(1, { prop: 'c', value: '3' });
            expect(this.rule.toString()).to.eql('a { a: 1; c: 3; b: 2 }');
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
            this.rule.insertAfter(0, this.new);
            expect(this.rule.toString()).to.eql('a { a: 1; c: 3; b: 2 }');
            expect(this.rule.nodes[1].before).to.eql(' ');
        });

        it('works with nodes too', () => {
            this.rule.insertAfter(this.rule.first, this.new);
            expect(this.rule.toString()).to.eql('a { a: 1; c: 3; b: 2 }');
        });

        it('receive hash instead of declaration', () => {
            this.rule.insertAfter(0, { prop: 'c', value: '3' });
            expect(this.rule.toString()).to.eql('a { a: 1; c: 3; b: 2 }');
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
            this.rule.remove(1);
            expect(this.rule.toString()).to.eql('a { a: 1 }');
        });

        it('removes by node', () => {
            this.rule.remove( this.rule.last );
            expect(this.rule.toString()).to.eql('a { a: 1 }');
        });

        it('cleans parent in removed node', () => {
            var decl = this.rule.first;
            this.rule.remove(decl);
            expect(decl.parent).to.not.exist();
        });

    });

    describe('removeAll()', () => {

        it('removes all children', () => {
            this.rule.removeAll();
            expect(this.rule.toString()).to.eql('a { }');
        });

    });

    describe('any()', () => {

        it('return true if all children return true', () => {
            expect(this.rule.every( i => i.prop.match(/a|b/) )).to.be.true;
            expect(this.rule.every( i => i.prop.match(/b/)   )).to.be.false;
        });

    });

    describe('some()', () => {

        it('return true if all children return true', () => {
            expect(this.rule.some( i => i.prop == 'b' )).to.be.true;
            expect(this.rule.some( i => i.prop == 'c' )).to.be.false;
        });

    });

    describe('index()', () => {

        it('returns child index', () => {
            expect(this.rule.index( this.rule.nodes[1] )).to.eql(1);
        });

        it('returns argument if it(is number', () => {
            expect(this.rule.index(2)).to.eql(2);
        });

    });

    describe('first', () => {

        it('returns first child', () => {
            expect(this.rule.first.prop).to.eql('a');
        });

    });

    describe('last', () => {

        it('returns last child', () => {
            expect(this.rule.last.prop).to.eql('b');
        });

    });

    describe('normalize()', () => {

        it("doesn't normalize new children with exists before", () => {
            this.rule.append({ prop: 'c', value: '3', before: '\n ' });
            expect(this.rule.toString()).to.eql('a { a: 1; b: 2;\n c: 3 }');
        });

    });

});
