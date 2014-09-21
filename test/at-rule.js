var Declaration = require('../lib/declaration');
var AtRule      = require('../lib/at-rule');
var parse       = require('../lib/parse');
var Rule        = require('../lib/rule');

describe('AtRule', () => {

    it('includes mixin by first child type', () => {
        for ( var name of ['append', 'prepend'] ) {
            var rule = new AtRule();
            rule[name]( new Rule() );
            rule.rules.should.be.instanceOf(Array);
            rule.rules.length.should.eql(1);

            rule = new AtRule();
            rule[name]( new AtRule() );
            rule.rules.should.be.instanceOf(Array);
            rule.rules.length.should.eql(1);

            rule = new AtRule();
            rule[name]( new Declaration() );
            rule.decls.should.be.instanceOf(Array);
            rule.decls.length.should.eql(1);
        }
    });

    it('initializes with properties', () => {
        var rule = new AtRule({ name: 'encoding', params: '"utf-8"' });

        rule.name.should.eql('encoding');
        rule.params.should.eql('"utf-8"');

        rule.toString().should.eql('@encoding "utf-8"');
    });

    describe('clone()', () => {

        it('clones with mixin', () => {
            var rule = new AtRule({ name: 'page', after: '' });
            rule.append(new Rule({ selector: 'a' }));

            rule.clone().toString().should.eql('@page {a {}}');
        });

    });

    describe('toString()', () => {

        it('inserts default spaces', () => {
            var rule = new AtRule({ name: 'page', params: 1, decls: [] });
            rule.toString().should.eql('@page 1 {}');
        });

        it('clone spaces from another comment', () => {
            var root = parse('@page{}');
            var rule = new AtRule({ name: 'page', params: 1, decls: [] });
            root.append(rule);

            rule.toString().should.eql('@page 1{}');
        });

    });

});
