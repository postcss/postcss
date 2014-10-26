var postcss = require('../lib/postcss');
var Result  = require('../lib/result');
var Root    = require('../lib/root');

var path = require('path');

describe('postcss.root()', () => {

    it('allows to build own CSS', () => {
        var root = postcss.root();
        var rule = postcss.rule({ selector: 'a' });
        rule.append( postcss.decl({ prop: 'color', value: 'black' }) );
        root.append( rule );

        root.toString().should.eql("a {\n    color: black\n}");
    });

});

describe('postcss()', () => {

    it('creates processors list', () => {
        postcss().should.eql({ processors: [] });
    });

    it('saves processors list', () => {
        var a = () => 1;
        var b = () => 2;
        postcss(a, b).should.eql({ processors: [a, b] });
    });

    it('saves processors list as array', () => {
        var a = () => 1;
        var b = () => 2;
        postcss([a, b]).should.eql({ processors: [a, b] });
    });

    it('saves processors object list', () => {
        var a = () => 1;
        postcss({ postcss: a }).should.eql({ processors: [a] });
    });

    describe('use()', () => {

        it('adds new processors', () => {
            var a = () => 1;
            var processor = postcss();
            processor.use(a);
            processor.should.eql({ processors: [a] });
        });

        it('adds new processor by object', () => {
            var a = () => 1;
            var processor = postcss();
            processor.use({ postcss: a });
            processor.should.eql({ processors: [a] });
        });

        it('adds new processor by object-function', () => {
            var a   = () => 1;
            var obj = () => 2;
            obj.postcss = a;
            var processor = postcss();
            processor.use(obj);
            processor.should.eql({ processors: [a] });
        });

        it('adds new processors of another postcss instance', () => {
            var a = () => 1;
            var processor = postcss();
            var otherProcessor = postcss(a);
            processor.use(otherProcessor);
            processor.should.eql({ processors: [a] });
        });

        it('returns itself', () => {
            var a = () => 1;
            var b = () => 2;
            postcss().use(a).use(b).should.eql({ processors: [a, b] });
        });

    });

    describe('process()', () => {
        before( () => {
            this.processor = postcss( (css) => {
                css.eachRule( (rule) => {
                    if ( !rule.selector.match(/::(before|after)/) ) return;
                    if ( !rule.some( i => i.prop == 'content' ) ) {
                        rule.prepend({ prop: 'content', value: '""' });
                    }
                });
            });
        });

        it('processes CSS', () => {
            var result = this.processor.process('a::before{top:0}');
            result.css.should.eql('a::before{content:"";top:0}');
        });

        it('processes parsed AST', () => {
            var root   = postcss.parse('a::before{top:0}');
            var result = this.processor.process(root);
            result.css.should.eql('a::before{content:"";top:0}');
        });

        it('processes previous result', () => {
            var result = postcss().process('a::before{top:0}');
            result = this.processor.process(result);
            result.css.should.eql('a::before{content:"";top:0}');
        });

        it('takes maps from previous result', () => {
            var one = postcss().process('a{}', {
                from: 'a.css',
                to:   'b.css',
                map:   true
            });
            var two = postcss().process(one, { to: 'c.css' });
            two.map.toJSON().sources.should.eql(['a.css']);
        });

        it('throws with file name', () => {
            var error;
            try {
                postcss().process('a {', { from: 'a.css' });
            } catch (e) {
                error = e;
            }

            error.file.should.eql(path.resolve('a.css'));
            error.message.should.match(/a.css:1:1: Unclosed block$/);
        });

        it('allows to replace Root', () => {
            var processor = postcss( () => new Root() );
            processor.process('a {}').css.should.eql('');
        });

        it('returns Result object', () => {
            var result = postcss().process('a{}');
            result.should.be.an.instanceOf(Result);
            result.css.should.eql(       'a{}');
            result.toString().should.eql('a{}');
        });

        it('calls all processors', () => {
            var calls = '';
            var a = () => calls += 'a';
            var b = () => calls += 'b';

            postcss(a, b).process('');
            calls.should.eql('ab');
        });

        it('parses, convert and stringify CSS', () => {
            var a = (css) => css.should.be.an.instanceof(Root);
            postcss(a).process('a {}').css.should.have.type('string');
        });

        it('send options to processors', () => {
            var a = (css, opts) => opts.should.eql({ from: 'a.css' });
            postcss(a).process('a {}', { from: 'a.css' });
        });

        it('accepts source map from PostCSS', () => {
            var one = postcss().process('a{}', {
                from: 'a.css',
                to:   'b.css',
                map:   true
            });
            var two = postcss().process(one.css, {
                from: 'b.css',
                to:   'c.css',
                map: { prev: one.map }
            });
            two.map.toJSON().sources.should.eql(['a.css']);
        });

    });

});
