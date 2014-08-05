var Declaration = require('../lib/declaration');
var Container   = require('../lib/container');
var parse       = require('../lib/parse');

var fs     = require('fs');
var should = require('should');

var cases = __dirname + '/cases/container/';
var read  = i => fs.readFileSync(cases + i + '.css').toString();

var compare = (css, ideal) => css.toString().should.eql( read(ideal) );

describe('Container', () => {
    beforeEach( () => {
        this.css  = parse( read('base') );
        this.rule = this.css.rules[0];

        this.new  = new Declaration({ prop: 'new', value: 'value' });
    });

    describe('push()', () => {

        it('adds child without checks', () => {
            this.rule.push(this.new);
            this.rule.list.length.should.eql(3);
            this.rule.last.should.not.have.property('before');
        });

    });

    describe('each()', () => {

        it('iterates', () => {
            var indexes = [];

            var result = this.rule.each( (decl, i) => {
                indexes.push(i);
                decl.should.eql( this.rule.decls[i] );
            });

            should.not.exists(result);
            indexes.should.eql([0, 1]);
        });

        it('iterates with prepend', () => {
            var size = 0;
            this.rule.each( () => {
                this.rule.prepend({ prop: 'color', value: 'aqua' });
                size += 1;
            });
            size.should.eql(2);
        });

        it('iterates with insertBefore', () => {
            var size = 0;
            this.rule.each( (decl) => {
                this.rule.insertBefore(decl, { prop: 'color', value: 'aqua' });
                size += 1;
            });
            size.should.eql(2);
        });

        it('iterates with insertAfter', () => {
            var size = 0;
            this.rule.each( (decl, i) => {
                this.rule.insertBefore(i - 1, { prop: 'color', value: 'aqua' });
                size += 1;
            });
            size.should.eql(2);
        });

        it('iterates with remove', () => {
            var size = 0;
            this.rule.each( () => {
                this.rule.remove(0);
                size += 1;
            });
            size.should.eql(2);
        });

        it('breaks iteration', () => {
            var indexes = [];

            var result = this.rule.each( (decl, i) => {
                indexes.push(i);
                return false;
            });

            result.should.be.false;
            indexes.should.eql([0]);
        });

    });

    describe('eachInside()', () => {
        beforeEach( () => {
            this.css = parse( read('each-recursivelly') );
        });

        it('iterates', () => {
            var types   = [];
            var indexes = [];

            var result = this.css.eachInside( (node, i) => {
                types.push(node.type);
                indexes.push(i);
            });

            should.not.exists(result);
            types.should.eql(  ['rule', 'decl', 'decl', 'comment', 'atrule',
                                'comment', 'rule', 'decl', 'atrule', 'rule',
                                'decl', 'atrule', 'decl', 'comment']);
            indexes.should.eql([0, 0, 1, 1, 2, 0, 1, 0, 3, 0, 0, 1, 0, 1]);
        });

        it('breaks iteration', () => {
            var indexes = [];

            var result = this.css.eachInside( (decl, i) => {
                indexes.push(i);
                return false;
            });

            result.should.be.false;
            indexes.should.eql([0]);
        });

    });

    describe('eachDecl()', () => {
        beforeEach( () => {
            this.css = parse( read('each-recursivelly') );
        });

        it('iterates', () => {
            var props   = [];
            var indexes = [];

            var result = this.css.eachDecl( (decl, i) => {
                props.push(decl.prop);
                indexes.push(i);
            });

            should.not.exists(result);
            props.should.eql(  ['a', 'b', 'c', 'd', 'e']);
            indexes.should.eql([0, 1, 0, 0, 0]);
        });

        it('iterates with changes', () => {
            var size = 0;
            this.css.eachDecl( (decl, i) => {
                decl.parent.remove(i);
                size += 1;
            });
            size.should.eql(5);
        });

        it('breaks iteration', () => {
            var indexes = [];

            var result = this.css.eachDecl( (decl, i) => {
                indexes.push(i);
                return false;
            });

            result.should.be.false;
            indexes.should.eql([0]);
        });

    });

    describe('eachComment()', () => {
        beforeEach( () => {
            this.css = parse( read('each-recursivelly') );
        });

        it('iterates', () => {
            var texts   = [];
            var indexes = [];

            var result = this.css.eachComment( (comment, i) => {
                texts.push(comment.text);
                indexes.push(i);
            });

            should.not.exists(result);
            texts.should.eql(  ['a', 'b', 'c']);
            indexes.should.eql([1, 0, 1]);
        });

        it('iterates with changes', () => {
            var size = 0;
            this.css.eachComment( (comment, i) => {
                comment.parent.remove(i);
                size += 1;
            });
            size.should.eql(3);
        });

        it('breaks iteration', () => {
            var indexes = [];

            var result = this.css.eachComment( (comment, i) => {
                indexes.push(i);
                return false;
            });

            result.should.be.false;
            indexes.should.eql([1]);
        });

    });

    describe('eachRule()', () => {
        beforeEach( () => {
            this.css = parse( read('each-recursivelly') );
        });

        it('iterates', () => {
            var selectors = [];
            var indexes   = [];

            var result = this.css.eachRule( (rule, i) => {
                selectors.push(rule.selector);
                indexes.push(i);
            });

            should.not.exists(result);
            selectors.should.eql(['a', 'to', 'em']);
            indexes.should.eql(  [0, 1, 0]);
        });

        it('iterates with changes', () => {
            var size = 0;
            this.css.eachRule( (rule, i) => {
                rule.parent.remove(i);
                size += 1;
            });
            size.should.eql(3);
        });

        it('breaks iteration', () => {
            var indexes = [];

            var result = this.css.eachRule( (rule, i) => {
                indexes.push(i);
                return false;
            });

            result.should.be.false;
            indexes.should.eql([0]);
        });

    });

    describe('eachAtRule()', () => {
        beforeEach( () => {
            this.css = parse( read('each-recursivelly') );
        });

        it('iterates', () => {
            var names   = [];
            var indexes = [];

            var result = this.css.eachAtRule( (atrule, i) => {
                names.push(atrule.name);
                indexes.push(i);
            });

            should.not.exists(result);
            names.should.eql(  ['keyframes', 'media', 'page']);
            indexes.should.eql([2, 3, 1]);
        });

        it('iterates with changes', () => {
            var size = 0;
            this.css.eachAtRule( (atrule, i) => {
                atrule.parent.remove(i);
                size += 1;
            });
            size.should.eql(3);
        });

        it('breaks iteration', () => {
            var indexes = [];

            var result = this.css.eachAtRule( (atrule, i) => {
                indexes.push(i);
                return false;
            });

            result.should.be.false;
            indexes.should.eql([2]);
        });

    });

    describe('append()', () => {

        it('appends child', () => {
            this.rule.append(this.new);
            compare(this.css, 'append');
        });

        it('receives hash instead of declaration', () => {
            this.rule.append({ prop: 'new', value: 'value' });
            compare(this.css, 'append');
        });

        it('receives root', () => {
            var css = parse('a {}');
            css.append( parse('b {}') );
            css.toString().should.eql('a {}b {}');
        });

        it('receives array', () => {
            var a = parse('a{ z-index: 1 }');
            var b = parse('b{width:1px;height:2px}');

            a.first.append( b.first.decls );
            a.toString().should.eql('a{ z-index: 1; width: 1px; height: 2px }');
            b.toString().should.eql('b{width:1px;height:2px}');
        });

        it('clones node on insert', () => {
            var a = parse('a{}');
            var b = parse('b{}');

            b.append(a.first);
            b.last.selector = 'b a';

            a.toString().should.eql('a{}');
            b.toString().should.eql('b{}b a{}');
        });

    });

    describe('prepend()', () => {

        it('prepends child', () => {
          this.rule.prepend(this.new);
          compare(this.css, 'prepend');
        });

        it('receive hash instead of declaration', () => {
            this.rule.prepend({ prop: 'new', value: 'value' });
            compare(this.css, 'prepend');
        });

        it('receives root', () => {
            var css = parse('a {}');
            css.prepend( parse('b {}') );
            css.toString().should.eql('b {}a {}');
        });

        it('receives array', () => {
            var a = parse('a{ z-index: 1 }');
            var b = parse('b{width:1px;height:2px}');

            a.first.prepend( b.first.decls );
            a.toString().should.eql('a{ width: 1px; height: 2px; z-index: 1 }');
        });

    });

    describe('insertBefore()', () => {

        it('inserts child', () => {
            this.rule.insertBefore(1, this.new);
            compare(this.css, 'insert');
        });

        it('works with nodes too', () => {
            this.rule.insertBefore(this.rule.decls[1], this.new);
            compare(this.css, 'insert');
        });

        it('receive hash instead of declaration', () => {
            this.rule.insertBefore(1, { prop: 'new', value: 'value' });
            compare(this.css, 'insert');
        });

        it('receives array', () => {
            var a = parse('a{ color: red; z-index: 1 }');
            var b = parse('b{width:1;height:2}');

            a.first.insertBefore(1, b.first.decls);
            a.toString().should.eql(
                'a{ color: red; width: 1; height: 2; z-index: 1 }');
        });

    });

    describe('insertAfter()', () => {

        it('inserts child', () => {
            this.rule.insertAfter(0, this.new);
            compare(this.css, 'insert');
        });

        it('works with nodes too', () => {
            this.rule.insertAfter(this.rule.decls[0], this.new);
            compare(this.css, 'insert');
        });

        it('receive hash instead of declaration', () => {
            this.rule.insertAfter(0, { prop: 'new', value: 'value' });
            compare(this.css, 'insert');
        });

        it('receives array', () => {
            var a = parse('a{ color: red; z-index: 1 }');
            var b = parse('b{width:1;height:2}');

            a.first.insertAfter(0, b.first.decls);
            a.toString().should.eql(
                'a{ color: red; width: 1; height: 2; z-index: 1 }');
        });

    });

    describe('remove()', () => {

        it('should remove by index', () => {
            this.rule.remove(1);
            compare(this.css, 'remove');
        });

        it('should remove by nide', () => {
            this.rule.remove( this.rule.decls[1] );
            compare(this.css, 'remove');
        });

    });

    describe('any()', () => {

        it('return true if all childs return true', () => {
            this.rule.every( i => i.prop.match(/a|b/) ).should.be.true;
            this.rule.every( i => i.prop.match(/b/) ).should.be.false;
        });

    });

    describe('some()', () => {

        it('return true if all childs return true', () => {
            this.rule.some( i => i.prop == 'b' ).should.be.true;
            this.rule.some( i => i.prop == 'c' ).should.be.false;
        });

    });

    describe('index()', () => {

        it('returns child index', () => {
            this.rule.index( this.rule.decls[1] ).should.eql(1);
        });

        it('returns argument if it(is number', () => {
            this.rule.index(2).should.eql(2);
        });

    });

    describe('first', () => {

        it('returns first child', () => {
            this.rule.first.prop.should.eql('a');
        });

    });

    describe('last', () => {

        it('returns last child', () => {
            this.rule.last.prop.should.eql('b');
        });

    });

    describe('normalize()', () => {

        it("doesn't normalize new childs with exists before", () => {
            this.new.before = "\n        ";
            this.rule.append(this.new);
            compare(this.css, 'indent');
        });

    });

});
