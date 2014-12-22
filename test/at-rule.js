var Declaration = require('../lib/declaration');
var AtRule      = require('../lib/at-rule');
var parse       = require('../lib/parse');
var Rule        = require('../lib/rule');

var expect = require('chai').expect;

describe('AtRule', () => {

    it('initializes with properties', () => {
        var rule = new AtRule({ name: 'encoding', params: '"utf-8"' });

        expect(rule.name).to.eql('encoding');
        expect(rule.params).to.eql('"utf-8"');

        expect(rule.toString()).to.eql('@encoding "utf-8"');
    });

    describe('clone()', () => {

        it('clones with mixin', () => {
            var rule = new AtRule({ name: 'page', after: '' });
            rule.append(new Rule({ selector: 'a' }));

            expect(rule.clone().toString()).to.eql('@page {a {}}');
        });

    });

    describe('toString()', () => {

        it('inserts default spaces', () => {
            var rule = new AtRule({ name: 'page', params: 1, nodes: [] });
            expect(rule.toString()).to.eql('@page 1 {}');
        });

        it('clone spaces from another at-rule', () => {
            var root = parse('@page{}');
            var rule = new AtRule({ name: 'page', params: 1, nodes: [] });
            root.append(rule);

            expect(rule.toString()).to.eql('@page 1{}');
        });

    });

});
