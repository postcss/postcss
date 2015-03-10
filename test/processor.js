import CssSyntaxError from '../lib/css-syntax-error';
import LazyResult     from '../lib/lazy-result';
import Processor      from '../lib/processor';
import postcss        from '../lib/postcss';
import Result         from '../lib/result';
import parse          from '../lib/parse';
import Root           from '../lib/root';

import { expect } from 'chai';
import   sinon    from 'sinon';
import   path     from 'path';

describe('Processor', () => {

    describe('use()', () => {

        it('adds new plugins', () => {
            let a = () => 1;
            let processor = new Processor();
            processor.use(a);
            expect(processor.plugins).to.eql([a]);
        });

        it('adds new plugin by object', () => {
            let a = () => 1;
            let processor = new Processor();
            processor.use({ postcss: a });
            expect(processor.plugins).to.eql([a]);
        });

        it('adds new plugin by object-function', () => {
            let a   = () => 1;
            let obj = () => 2;
            obj.postcss = a;
            let processor = new Processor();
            processor.use(obj);
            expect(processor.plugins).to.eql([a]);
        });

        it('adds new processors of another postcss instance', () => {
            let a = () => 1;
            let processor = new Processor();
            let other     = new Processor([a]);
            processor.use(other);
            expect(processor.plugins).to.eql([a]);
        });

        it('returns itself', () => {
            let a = () => 1;
            let b = () => 2;
            let processor = new Processor();
            expect(processor.use(a).use(b).plugins).to.eql([a, b]);
        });

    });

    describe('process()', () => {
        beforeEach( () => {
            sinon.stub(console, 'warn');
        });

        afterEach( () => {
            console.warn.restore();
        });

        let beforeFix = new Processor([ (css) => {
            css.eachRule( (rule) => {
                if ( !rule.selector.match(/::(before|after)/) ) return;
                if ( !rule.some( i => i.prop === 'content' ) ) {
                    rule.prepend({ prop: 'content', value: '""' });
                }
            });
        }]);

        it('processes CSS', () => {
            let result = beforeFix.process('a::before{top:0}');
            expect(result.css).to.eql('a::before{content:"";top:0}');
        });

        it('processes parsed AST', () => {
            let root   = parse('a::before{top:0}');
            let result = beforeFix.process(root);
            expect(result.css).to.eql('a::before{content:"";top:0}');
        });

        it('processes previous result', () => {
            let result = (new Processor()).process('a::before{top:0}');
            result = beforeFix.process(result);
            expect(result.css).to.eql('a::before{content:"";top:0}');
        });

        it('takes maps from previous result', () => {
            let one = (new Processor()).process('a{}', {
                from: 'a.css',
                to:   'b.css',
                map: { inline: false }
            });
            let two = (new Processor()).process(one, {
                to:   'c.css',
                map: { inline: false }
            });
            expect(two.map.toJSON().sources).to.eql(['a.css']);
        });

        it('throws with file name', () => {
            let error;
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
            let processor = new Processor([ () => new Root() ]);
            expect(processor.process('a {}').css).to.eql('');
        });

        it('returns LazyResult object', () => {
            let result = (new Processor()).process('a{}');
            expect(result).to.be.an.instanceOf(LazyResult);
            expect(result.css).to.eql(       'a{}');
            expect(result.toString()).to.eql('a{}');
        });

        it('calls all plugins once', (done) => {
            let calls = '';
            let a = () => calls += 'a';
            let b = () => calls += 'b';

            let result = new Processor([a, b]).process('');
            result.css;
            result.map;
            result.root;
            result.then( () => {
                expect(calls).to.eql('ab');
                done();
            }).catch( (error) => done(error) );
        });

        it('parses, converts and stringifies CSS', () => {
            let a = (css) => expect(css).to.be.an.instanceof(Root);
            expect((new Processor([a])).process('a {}').css).to.be.a('string');
        });

        it('send result to plugins', () => {
            let processor = new Processor();
            let a = (css, result) => {
                expect(result).to.be.an.instanceof(Result);
                expect(result.processor).to.eql(processor);
                expect(result.opts).to.eql({ map: true });
                expect(result.root).to.eql(css);
            };
            processor.use(a).process('a {}', { map: true });
        });

        it('accepts source map from PostCSS', () => {
            let one = (new Processor()).process('a{}', {
                from: 'a.css',
                to:   'b.css',
                map:   { inline: false }
            });
            let two = (new Processor()).process(one.css, {
                from: 'b.css',
                to:   'c.css',
                map: { prev: one.map, inline: false }
            });
            expect(two.map.toJSON().sources).to.eql(['a.css']);
        });

        it('supports async plugins', (done) => {
            let async = (css) => {
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
            let calls = 0;
            let async = () => {
                return new Promise( (resolve) => {
                    setTimeout(() => {
                        calls += 1;
                        resolve();
                    }, 1);
                });
            };

            let result = (new Processor([async])).process('a {}');
            result.then( () => { });
            result.then( () => {
                result.then( () => {
                    expect(calls).to.eql(1);
                    done();
                });
            });
        });

        it('supports async errors', (done) => {
            let error = new Error('Async');
            let async = () => {
                return new Promise( (resolve, reject) => {
                    reject(error);
                });
            };
            (new Processor([async])).process('').then( () => {
                done('should not run then callback');
            }).catch(function (err) {
                expect(err).to.eql(error);
                done();
            });
        });

        it('supports sync errors in async mode', (done) => {
            let error = new Error('Async');
            let async = () => {
                throw error;
            };
            (new Processor([async])).process('').then( () => {
                done('should not run then callback');
            }).catch(function (err) {
                expect(err).to.eql(error);
                done();
            });
        });

        it('throws error on sync method to async plugin', () => {
            let async = () => {
                return new Promise( (resolve) => resolve() );
            };
            expect(() => {
                (new Processor([async])).process('a{}').css;
            }).to.throw(/async/);
        });

        it('checks plugin compatibility', () => {
            let plugin = postcss.plugin('test', function () {
                return function () {
                    throw 'Er';
                };
            });
            let func = plugin();
            func.postcssVersion = '2.1.5';

            let processBy = (version) => {
                let processor = new Processor([func]);
                processor.version = version;
                processor.process('a{}').css;
            };

            expect( () => processBy('1.0.0') ).to.throws('Er');
            expect(console.warn.callCount).to.eql(1);
            expect(console.warn.args[0][0]).to.eql(
                'test is based on PostCSS 2.1.5 but you use it with ' +
                'PostCSS 1.0.0. Maybe this is a source of error below.');

            expect( () => processBy('3.0.0') ).to.throws('Er');
            expect(console.warn.callCount).to.eql(2);

            expect( () => processBy('2.0.0') ).to.throws('Er');
            expect(console.warn.callCount).to.eql(3);

            expect( () => processBy('2.1.0') ).to.throws('Er');
            expect(console.warn.callCount).to.eql(3);
        });

        it('sets last plugin to result', (done) => {
            let plugin1 = function (css, result) {
                expect(result.lastPlugin).to.equal(plugin1);
            };
            let plugin2 = function (css, result) {
                expect(result.lastPlugin).to.equal(plugin2);
            };

            let processor = new Processor([plugin1, plugin2]);
            processor.process('a{}').then( (result) => {
                expect(result.lastPlugin).to.equal(plugin2);
                done();
            });
        });

    });

    describe('version', () => {

        it('contains PostCSS version', () => {
            expect((new Processor()).version).to.match(/\d+.\d+.\d+/);
        });

    });

});
