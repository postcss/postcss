import Processor from '../lib/processor';
import postcss   from '../lib/postcss';

import { expect } from 'chai';

describe('postcss()', () => {

    it('creates plugins list', () => {
        var processor = postcss();
        expect(processor).to.be.instanceOf(Processor);
        expect(processor.plugins).to.eql([]);
    });

    it('saves plugins list', () => {
        var a = () => 1;
        var b = () => 2;
        expect(postcss(a, b).plugins).to.eql([a, b]);
    });

    it('saves plugins list as array', () => {
        var a = () => 1;
        var b = () => 2;
        expect(postcss([a, b]).plugins).to.eql([a, b]);
    });

    describe('.root()', () => {

        it('allows to build own CSS', () => {
            var root = postcss.root();
            var rule = postcss.rule({ selector: 'a' });
            rule.append( postcss.decl({ prop: 'color', value: 'black' }) );
            root.append( rule );

            expect(root.toString()).to.eql("a {\n    color: black\n}");
        });

    });

    describe('.vendor', () => {

        it('contains vendor module', () => {
            expect(postcss.vendor.prefix('-moz-tab')).to.eql('-moz-');
        });

    });

    describe('.parse', () => {

        it('contains parser', () => {
            expect(postcss.parse('').type).to.eql('root');
        });

    });

    describe('.list', () => {

        it('contains list module', () => {
            expect(postcss.list.space('a b')).to.eql(['a', 'b']);
        });

    });

});
