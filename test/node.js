var Declaration = require('../lib/declaration');
var AtRule      = require('../lib/at-rule');
var Node        = require('../lib/node');
var Root        = require('../lib/root');
var Rule        = require('../lib/rule');

var expect = require('chai').expect;

describe('Node', () => {

    describe('removeSelf()', () => {

        it('removes node from parent', () => {
            var rule = new Rule({ selector: 'a' });
            rule.append({ prop: 'color', value: 'black' });

            rule.nodes[0].removeSelf();
            expect(rule.nodes).to.be.empty;
        });

    });

    describe('replace()', () => {

        it('inserts new node', () => {
            var rule = new Rule({ selector: 'a' });
            rule.append({ prop: 'color', value: 'black' });
            rule.append({ prop: 'width', value: '1px' });
            rule.append({ prop: 'height', value: '1px' });

            var node   = new Declaration({ prop: 'min-width', value: '1px' });
            var width  = rule.nodes[1];
            var result = width.replace(node);

            expect(result).to.eql(width);

            expect(rule.toString()).to.eql('a {\n' +
                                       '    color: black;\n' +
                                       '    min-width: 1px;\n' +
                                       '    height: 1px\n' +
                                       '}');
        });

        it('inserts new root', () => {
            var root = new Root();
            root.append( new AtRule({ name: 'import', params: '"a.css"' }) );

            var a = new Root();
            a.append( new Rule({ selector: 'a' }) );
            a.append( new Rule({ selector: 'b' }) );

            root.first.replace(a);
            expect(root.toString()).to.eql('a {}\nb {}');
        });

    });

    describe('clone()', () => {

        it('clones nodes', () => {
            var rule = new Rule({ selector: 'a', after: '' });
            rule.append({ prop: 'color', value: '/**/black', before: '' });

            var clone = rule.clone();
            clone.append({ prop: 'display', value: 'none' });

            expect(clone.first.parent).to.equal(clone);
            expect(rule.first.parent).to.equal(rule);

            expect(rule.toString()).to.eql('a {color: /**/black}');
            expect(clone.toString()).to.eql('a {color: /**/black;display: none}');
        });

        it('overrides properties', () => {
            var rule  = new Rule({ selector: 'a' });
            var clone = rule.clone({ selector: 'b' });
            expect(clone.selector).to.eql('b');
        });

    });

    describe('toJSON()', () => {

        it('cleans parents inside', () => {
            var rule = new Rule({ selector: 'a' });
            rule.append({ prop: 'color', value: 'b' });

            var json = rule.toJSON();
            expect(json.parent).to.not.exist();
            expect(json.nodes[0].parent).to.not.exist();

            expect(JSON.stringify(rule)).to.eql(
                '{"type":"rule","nodes":[' +
                    '{"type":"decl","prop":"color","value":"b"}' +
                '],"selector":"a"}');
        });

    });

    describe('style()', () => {

        it('uses node style', () => {
            var rule = new Rule({ selector: 'a', before: ' ' });
            expect(rule.style('beforeRule')).to.eql(' ');
        });

        it('hacks before for nodes without parent', () => {
            var rule = new Rule({ selector: 'a' });
            expect(rule.style('beforeRule')).to.eql('');
        });

        it('hacks before for first node', () => {
            var root = new Root();
            root.append(new Rule({ selector: 'a' }));
            expect(root.first.style('beforeRule')).to.eql('');
        });

        it('hacks before for first decl', () => {
            var decl = new Declaration({ prop: 'color', value: 'black' });
            expect(decl.style('beforeDecl')).to.eql('');

            var rule = new Rule({ selector: 'a' });
            rule.append(decl);
            expect(decl.style('beforeDecl')).to.eql('\n    ');
        });

        it('uses defaults without parent', () => {
            var rule = new Rule({ selector: 'a' });
            expect(rule.style('beforeOpen')).to.eql(' ');
        });

        it('uses defaults for unique node', () => {
            var root = new Root();
            root.append(new Rule({ selector: 'a' }));
            expect(root.first.style('beforeOpen')).to.eql(' ');
        });

        it('clones style from first node', () => {
            var root = new Root();
            root.append( new Rule({ selector: 'a', between: '' }) );
            root.append( new Rule({ selector: 'b' }) );

            expect(root.last.style('beforeOpen')).to.eql('');
        });

    });

    describe('stringifyRaw()', () => {
        it('creates trimmed/raw property', () => {
            var b = new Node();

            b.one  = 'trim';
            b._one = { value: 'trim', raw: 'raw' };
            expect(b.stringifyRaw('one')).to.eql('raw');

            b.one = 'trim1';
            expect(b.stringifyRaw('one')).to.eql('trim1');
        });

        it('works without magic', () => {
            var b = new Node();
            b.one = '1';
            expect(b.one).to.eql('1');
            expect(b.stringifyRaw('one')).to.eql('1');
        });

    });

});
