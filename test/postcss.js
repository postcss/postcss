import Processor from '../lib/processor';
import postcss   from '../lib/postcss';
import Result    from '../lib/result';

import { expect } from 'chai';
import   sinon    from 'sinon';

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

    describe('.plugin()', () => {
        beforeEach( () => {
            sinon.stub(console, 'warn');
        });

        afterEach( () => {
            console.warn.restore();
        });

        it('creates plugin', () => {
            var plugin = postcss.plugin('test', (filter) => {
                return function (css, processor) {
                    css.eachDecl(filter || 'two', function (decl) {
                        decl.removeSelf();
                    });
                };
            });

            var func1 = postcss(plugin).plugins[0];
            expect(func1.postcssPlugin).to.eql('test');
            expect(func1.postcssVersion).to.match(/\d+.\d+.\d+/);

            var func2 = postcss(plugin()).plugins[0];
            expect(func2.postcssPlugin).to.eql(func1.postcssPlugin);
            expect(func2.postcssVersion).to.eql(func1.postcssVersion);

            var result1 = postcss(plugin('one')).process('a{ one: 1; two: 2 }');
            expect(result1.css).to.eql('a{ two: 2 }');

            var result2 = postcss(plugin).process('a{ one: 1; two: 2 }');
            expect(result2.css).to.eql('a{ one: 1 }');
        });

        it('wraps plugin to version check', () => {
            var result = (version) => {
                var processor = new Processor();
                processor.version = version;
                return new Result(processor, null, { });
            };

            var plugin = postcss.plugin('test', function () {
                return function (css) {
                    throw 'Er';
                };
            });
            var func = plugin();
            func.postcssVersion = '2.1.5';

            expect( () => func({ }, result('1.0.0')) ).to.throws('Er');
            expect(console.warn.callCount).to.eql(1);
            expect(console.warn.args[0][0]).to.eql(
                'test is based on PostCSS 2.1.5 but you use it with ' +
                'PostCSS 1.0.0. Maybe this is a source of error below.');

            expect( () => func({ }, result('3.0.0')) ).to.throws('Er');
            expect(console.warn.callCount).to.eql(2);

            expect( () => func({ }, result('2.0.0')) ).to.throws('Er');
            expect(console.warn.callCount).to.eql(3);

            expect( () => func({ }, result('2.1.0')) ).to.throws('Er');
            expect(console.warn.callCount).to.eql(3);
        });

    });

    describe('.parse()', () => {

        it('contains parser', () => {
            expect(postcss.parse('').type).to.eql('root');
        });

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

    describe('.list', () => {

        it('contains list module', () => {
            expect(postcss.list.space('a b')).to.eql(['a', 'b']);
        });

    });

});
