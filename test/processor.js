import CssSyntaxError from '../lib/css-syntax-error';
import LazyResult     from '../lib/lazy-result';
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

        it('returns LazyResult object', () => {
            var result = (new Processor()).process('a{}');
            expect(result).to.be.an.instanceOf(LazyResult);
            expect(result.css).to.eql(       'a{}');
            expect(result.toString()).to.eql('a{}');
        });

        it('calls all plugins once', (done) => {
            var calls = '';
            var a = () => calls += 'a';
            var b = () => calls += 'b';

            var result = new Processor([a, b]).process('');
            result.css;
            result.map;
            result.root;
            result.then( () => {
                expect(calls).to.eql('ab');
                done();
            }).catch( (error) => done(error) );
        });

        it('parses, converts and stringifies CSS', () => {
            var a = (css) => expect(css).to.be.an.instanceof(Root);
            expect((new Processor([a])).process('a {}').css).to.be.a('string');
        });

        it('send result to plugins', () => {
            var processor = new Processor();
            var a = (css, result) => {
                expect(result).to.be.an.instanceof(Result);
                expect(result.processor).to.eql(processor);
                expect(result.opts).to.eql({ map: true });
                expect(result.root).to.eql(css);
            };
            processor.use(a).process('a {}', { map: true });
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

        it('supports async plugins', (done) => {
            var async = (css) => {
                return new Promise( (resolve) => {
                    setTimeout(() => {
                        css.append({ selector: 'a' });
                        resolve();
                    }, 1);
                });
            };
            (new Processor([async])).process('').then( (result) => {
                expect(result.css).to.eql('a {}');
                done();
            }).catch( (error) => done(error) );
        });

        it('works async without plugins', (done) => {
            (new Processor()).process('a {}').then( (result) => {
                expect(result.css).to.eql('a {}');
                done();
            }).catch( (error) => done(error) );
        });

        it('runs async plugin only once', (done) => {
            var calls = 0;
            var async = (css) => {
                return new Promise( (resolve) => {
                    setTimeout(() => {
                        calls += 1;
                        resolve();
                    }, 1);
                });
            };

            var result = (new Processor([async])).process('a {}');
            result.then( () => { });
            result.then( () => {
                result.then( () => {
                    expect(calls).to.eql(1);
                    done();
                });
            });
        });

        it('supports async errors', (done) => {
            var error = new Error('Async');
            var async = (css) => {
                return new Promise( (resolve, reject) => {
                    reject(error);
                });
            };
            (new Processor([async])).process('').then( () => {
                done('should not run then callback');
            }).catch(function (error) {
                expect(error).to.eql(error);
                done();
            });
        });

        it('supports sync errors in async mode', (done) => {
            var error = new Error('Async');
            var async = (css) => {
                throw error;
            };
            (new Processor([async])).process('').then( () => {
                done('should not run then callback');
            }).catch(function (error) {
                expect(error).to.eql(error);
                done();
            });
        });

        it('throws error on sync method to async plugin', () => {
            var async = (css) => {
                return new Promise( (resolve) => resolve() );
            };
            expect(() => {
                (new Processor([async])).process('a{}').css;
            }).to.throw(/async/);
        });

    });

    describe('version', () => {

        it('contains PostCSS version', () => {
            expect((new Processor()).version).to.match(/\d+.\d+.\d+/);
        });

    });

});
