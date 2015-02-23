import CssSyntaxError from '../lib/css-syntax-error';
import Processor      from '../lib/processor';
import Result         from '../lib/result';
import parse          from '../lib/parse';
import Root           from '../lib/root';

import { expect } from 'chai';
import   path     from 'path';

describe('Processor', () => {

    describe('use()', () => {

        it('adds new plugins', () => {
            var a = () => 1;
            var processor = new Processor();
            processor.use(a);
            expect(processor.plugins).to.eql([a]);
        });

        it('adds new plugin by object', () => {
            var a = () => 1;
            var processor = new Processor();
            processor.use({ postcss: a });
            expect(processor.plugins).to.eql([a]);
        });

        it('adds new plugin by object-function', () => {
            var a   = () => 1;
            var obj = () => 2;
            obj.postcss = a;
            var processor = new Processor();
            processor.use(obj);
            expect(processor.plugins).to.eql([a]);
        });

        it('adds new processors of another postcss instance', () => {
            var a = () => 1;
            var processor = new Processor();
            var other     = new Processor([a]);
            processor.use(other);
            expect(processor.plugins).to.eql([a]);
        });

        it('returns itself', () => {
            var a = () => 1;
            var b = () => 2;
            var processor = new Processor();
            expect(processor.use(a).use(b).plugins).to.eql([a, b]);
        });

    });

    describe('process()', () => {
        var processor = new Processor([ (css) => {
            css.eachRule( (rule) => {
                if ( !rule.selector.match(/::(before|after)/) ) return;
                if ( !rule.some( i => i.prop == 'content' ) ) {
                    rule.prepend({ prop: 'content', value: '""' });
                }
            });
        }]);

        it('processes CSS', () => {
            var result = processor.process('a::before{top:0}');
            expect(result.css).to.eql('a::before{content:"";top:0}');
        });

        it('processes parsed AST', () => {
            var root   = parse('a::before{top:0}');
            var result = processor.process(root);
            expect(result.css).to.eql('a::before{content:"";top:0}');
        });

        it('processes previous result', () => {
            var result = (new Processor()).process('a::before{top:0}');
            result = processor.process(result);
            expect(result.css).to.eql('a::before{content:"";top:0}');
        });

        it('takes maps from previous result', () => {
            var one = (new Processor()).process('a{}', {
                from: 'a.css',
                to:   'b.css',
                map: { inline: false }
            });
            var two = (new Processor()).process(one, {
                to:   'c.css',
                map: { inline: false }
            });
            expect(two.map.toJSON().sources).to.eql(['a.css']);
        });

        it('throws with file name', () => {
            var error;
            try {
                (new Processor()).process('a {', { from: 'a.css' });
            } catch (e) {
                if ( e instanceof CssSyntaxError ) {
                    error = e;
                } else {
                    throw e;
                }
            }

            expect(error.file).to.eql(path.resolve('a.css'));
            expect(error.message).to.match(/a.css:1:1: Unclosed block$/);
        });

        it('allows to replace Root', () => {
            var processor = new Processor([ () => new Root() ]);
            expect(processor.process('a {}').css).to.eql('');
        });

        it('returns Result object', () => {
            var result = (new Processor()).process('a{}');
            expect(result).to.be.an.instanceOf(Result);
            expect(result.css).to.eql(       'a{}');
            expect(result.toString()).to.eql('a{}');
        });

        it('calls all plugins', () => {
            var calls = '';
            var a = () => calls += 'a';
            var b = () => calls += 'b';

            (new Processor([a, b])).process('');
            expect(calls).to.eql('ab');
        });

        it('parses, convert and stringify CSS', () => {
            var a = (css) => expect(css).to.be.an.instanceof(Root);
            expect((new Processor([a])).process('a {}').css).to.be.a('string');
        });

        it('send options to plugins', () => {
            var a = (css, opts) => expect(opts).to.eql({ from: 'a.css' });
            (new Processor([a])).process('a {}', { from: 'a.css' });
        });

        it('accepts source map from PostCSS', () => {
            var one = (new Processor()).process('a{}', {
                from: 'a.css',
                to:   'b.css',
                map:   { inline: false }
            });
            var two = (new Processor()).process(one.css, {
                from: 'b.css',
                to:   'c.css',
                map: { prev: one.map, inline: false }
            });
            expect(two.map.toJSON().sources).to.eql(['a.css']);
        });

    });

});
