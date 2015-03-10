import Processor from '../lib/processor';
import postcss   from '../lib/postcss';

import { expect } from 'chai';

describe('postcss()', () => {

    it('creates plugins list', () => {
        let processor = postcss();
        expect(processor).to.be.instanceOf(Processor);
        expect(processor.plugins).to.eql([]);
    });

    it('saves plugins list', () => {
        let a = () => 1;
        let b = () => 2;
        expect(postcss(a, b).plugins).to.eql([a, b]);
    });

    it('saves plugins list as array', () => {
        let a = () => 1;
        let b = () => 2;
        expect(postcss([a, b]).plugins).to.eql([a, b]);
    });

    describe('.plugin()', () => {

        it('creates plugin', () => {
            let plugin = postcss.plugin('test', (filter) => {
                return function (css) {
                    css.eachDecl(filter || 'two', function (decl) {
                        decl.removeSelf();
                    });
                };
            });

            let func1 = postcss(plugin).plugins[0];
            expect(func1.postcssPlugin).to.eql('test');
            expect(func1.postcssVersion).to.match(/\d+.\d+.\d+/);

            let func2 = postcss(plugin()).plugins[0];
            expect(func2.postcssPlugin).to.eql(func1.postcssPlugin);
            expect(func2.postcssVersion).to.eql(func1.postcssVersion);

            let result1 = postcss(plugin('one')).process('a{ one: 1; two: 2 }');
            expect(result1.css).to.eql('a{ two: 2 }');

            let result2 = postcss(plugin).process('a{ one: 1; two: 2 }');
            expect(result2.css).to.eql('a{ one: 1 }');
        });

    });

    describe('.parse()', () => {

        it('contains parser', () => {
            expect(postcss.parse('').type).to.eql('root');
        });

    });

    describe('.root()', () => {

        it('allows to build own CSS', () => {
            let root = postcss.root();
            let rule = postcss.rule({ selector: 'a' });
            rule.append( postcss.decl({ prop: 'color', value: 'black' }) );
            root.append( rule );

            expect(root.toString()).to.eql('a {\n    color: black\n}');
        });

    });

    describe('.vendor', () => {

        it('contains vendor module', () => {
            expect(postcss.vendor.prefix('-moz-tab')).to.eql('-moz-');
        });

    });

    describe('.list', () => {

        it('contains list module', () => {
            expect(postcss.list.space('a b')).to.eql(['a', 'b']);
        });

    });

});
