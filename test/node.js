var AtRule = require('../lib/at-rule');
var Node   = require('../lib/node');
var Root   = require('../lib/root');
var Rule   = require('../lib/rule');
var Raw    = require('../lib/raw');

var should = require('should');

describe('Node', () => {

    describe('.raw()', () => {
        class B extends Node { }
        B.raw('one');

        it('creates trimmed/raw property', () => {
            var b = new B();

            should.not.exists(b.one);

            b.one = new Raw('trim', 'raw');
            b.one.should.eql('trim');
            b._one.toString().should.eql('raw');

            b.one = 'trim1';
            b.one.should.eql('trim1');
            b._one.toString().should.eql('trim1');
        });

        it('works without magic', () => {
            var b = new B();

            b.one = '1';
            b.one.should.eql('1');
            b._one.toString().should.eql('1');
        });

    });

    describe('removeSelf()', () => {

        it('removes node from parent', () => {
            var rule = new Rule({ selector: 'a' });
            rule.append({ prop: 'color', value: 'black' });

            rule.decls[0].removeSelf();
            rule.decls.should.be.empty;
        });

    });

    describe('clone()', () => {

        it('clones nodes', () => {
            var rule = new Rule({ selector: 'a' });
            rule.append({ prop: 'color', value: '/**/black', before: '' });

            var clone = rule.clone();
            clone.append({ prop: 'display', value: 'none' });

            clone.decls[0].parent.should.exactly(clone);
            rule.decls[0].parent.should.exactly(rule);

            rule.toString().should.eql('a {color: /**/black}');
            clone.toString().should.eql('a {color: /**/black;display: none}');
        });

        it('overrides properties', () => {
            var rule  = new Rule({ selector: 'a' });
            var clone = rule.clone({ selector: 'b' });
            clone.selector.should.eql('b');
        });

    });

    describe('toJSON()', () => {

        it('cleans parents inside', () => {
            var rule = new Rule({ selector: 'a' });
            rule.append({ prop: 'color', value: 'b' });

            var json = rule.toJSON();
            should.not.exists(json.parent);
            should.not.exists(json.decls[0].parent);

            JSON.stringify(rule).should.eql(
                '{"type":"rule","decls":[' +
                    '{"type":"decl","prop":"color","_value":"b"}' +
                '],"_selector":"a"}');
        });

    });

    describe('style()', () => {

        it('uses defaults without parent', () => {
            var rule = new Rule({ selector: 'a' });
            rule.style().should.eql({ between: ' ', after: '' });
        });

        it('uses defaults for artificial nodes', () => {
            var root = new Root();
            root.append(new Rule({ selector: 'a' }));
            root.first.style().should.eql({ between: ' ', after: '' });
        });

        it('uses nodes style', () => {
            var root = new Root();
            root.append( new Rule({ selector: 'a', between: '', after: '' }) );
            root.first.style().should.eql({ between: '', after: '' });
        });

        it('clones style from first node', () => {
            var root = new Root();
            root.append( new Rule({ selector: 'a', between: '', after: ' ' }) );
            root.append( new Rule({ selector: 'b' }) );

            root.last.style().should.eql({ between: '', after: ' ' });
        });

        it('uses different style for different node style type', () => {
            var root = new Root();
            root.append( new AtRule({ name: 'page', rules: [] }) );
            root.append( new AtRule({ name: 'import' }) );

            root.first.style().should.eql({ between: ' ', after: '' });
            root.last.style().should.eql( { between: '' });
        });

    });

});
