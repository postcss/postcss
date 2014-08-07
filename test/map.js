var postcss = require('../lib/postcss');

var mozilla = require('source-map');
var should  = require('should');
var fs      = require('fs-extra');

var consumer = map => new mozilla.SourceMapConsumer.fromSourceMap(map);

describe('source maps', () => {
    before( () => {
        this.dir = __dirname + '/fixtures';

        this.doubler = postcss( (css) => {
            css.eachDecl( decl => decl.parent.prepend(decl.clone()) );
        });
        this.lighter = postcss( (css) => {
            css.eachDecl( decl => decl.value = 'white' );
        });
    });

    afterEach( () => {
        if ( fs.existsSync(this.dir) ) fs.removeSync(this.dir);
    });

    it('adds map field only on request', () => {
        should.not.exists(postcss().process('a {}').map);
    });

    it('return map generator', () => {
        postcss().process('a {}', { map: true }).map
            .should.be.instanceOf(mozilla.SourceMapGenerator);
    });

    it('generate right source map', () => {
        var css       = "a {\n  color: black;\n  }";
        var processor = postcss( (css) => {
            css.eachRule( (rule) => {
                rule.selector = 'strong';
            });
            css.eachDecl( (decl) => {
                decl.parent.prepend( decl.clone({ prop: 'background' }) );
            });
        });

        var result = processor.process(css, {
            from: 'a.css',
            to:   'b.css',
            map:  true
        });
        var map = consumer(result.map);

        map.file.should.eql('b.css');

        map.originalPositionFor({ line: 1, column: 0 }).should.eql({
            source: 'a.css',
            line:   1,
            column: 0,
            name:   null
        });
        map.originalPositionFor({ line: 2, column: 2 }).should.eql({
            source: 'a.css',
            line:   2,
            column: 2,
            name:   null
        });
        map.originalPositionFor({ line: 3, column: 2 }).should.eql({
            source: 'a.css',
            line:   2,
            column: 2,
            name:   null
        });
    });

    it('changes previous source map', () => {
      var css = 'a { color: black }';

      var doubled = this.doubler.process(css, {
          from: 'a.css',
          to:   'b.css',
          map:  true
      });

      var lighted = this.lighter.process(doubled.css, {
          from: 'b.css',
          to:   'c.css',
          map: { prev: doubled.map }
      });

      consumer(lighted.map)
          .originalPositionFor({ line: 1, column: 18 }).should.eql({
              source: 'a.css',
              line:   1,
              column: 4,
              name:   null
          });
    });

    it('adds source map annotation', () => {
        var css    = 'a { }/*# sourceMappingURL=a.css.map */';
        var result = postcss().process(css, {
            from: 'a.css',
            to:   'b.css',
            map:  true
        });

        result.css.should.eql("a { }\n/*# sourceMappingURL=b.css.map */");
    });

    it('misses source map annotation, if user ask', () => {
        var css    = 'a { }';
        var result = postcss().process(css, {
            from: 'a.css',
            to:   'b.css',
            map: { annotation: false }
        });

        result.css.should.eql(css);
    });

    it('misses source map annotation, if previous map missed it', () => {
        var css = 'a { }';

        var step1 = postcss().process(css, {
            from: 'a.css',
            to:   'b.css',
            map: { annotation: false }
        });

        var step2 = postcss().process(step1.css, {
            from: 'b.css',
            to:   'c.css',
            map: { prev: step1.map }
        });

        step2.css.should.eql(css);
    });

    it('uses user path in annotation, relative to options.to', () => {
        var result = postcss().process('a { }', {
            from: 'source/a.css',
            to:   'build/b.css',
            map: { annotation: 'maps/b.map' }
        });

        result.css.should.eql("a { }\n/*# sourceMappingURL=maps/b.map */");
        var map = consumer(result.map);

        map.file.should.eql('../b.css');
        map.originalPositionFor({ line: 1, column: 0 })
            .source.should.eql('../../source/a.css');
    });

    it('generates inline map', () => {
        var css = 'a { }';

        var common = postcss().process(css, {
            from: 'a.css',
            to:   'b.css',
            map:   true
        });

        var inline = postcss().process(css, {
          from: 'a.css',
          to:   'b.css',
          map: { inline: true }
        });

        should.not.exists(inline.map);
        inline.css.should.match(/# sourceMappingURL=data:/);

        var base64 = new Buffer(common.map).toString('base64');
        inline.css.should.endWith(base64 + ' */');
    });

    it('generates inline map by shortcut', () => {
        var inline = postcss().process('a { }', {
            from: 'a.css',
            to:   'b.css',
            map:  'inline'
        });

        inline.css.should.match(/# sourceMappingURL=data:/);
    });

    it('generates inline map if previous map was inline', () => {
        var css = 'a { color: black }';

        var common1 = this.doubler.process(css, {
            from: 'a.css',
            to:   'b.css',
            map:   true
        });
        var common2 = this.lighter.process(common1.css, {
            from: 'b.css',
            to:   'c.css',
            map: { prev: common1.map }
        });

        var inline1 = this.doubler.process(css, {
            from: 'a.css',
            to:   'b.css',
            map: { inline: true }
        });
        var inline2 = this.lighter.process(inline1.css, {
            from: 'b.css',
            to:   'c.css'
        });

        var base64 = new Buffer(common2.map).toString('base64');
        inline2.css.should.endWith(base64 + ' */');
    });

    it('allows change map type', () => {
        var css = 'a { }';

        var step1 = postcss().process(css, {
            from: 'a.css',
            to:   'b.css',
            map: { inline: true }
        });

        var step2 = postcss().process(step1.css, {
            from: 'b.css',
            to:   'c.css',
            map: { inline: false }
        });

        step2.should.have.property('map');
        step2.css.should.not.match(/# sourceMappingURL=data:/);
    });

    it('miss check files on requires', () => {
        var step1 = this.doubler.process('a { }', {
            from: 'a.css',
            to:    this.dir + '/a.css',
            map:   true
        });

        fs.outputFileSync(this.dir + '/a.css.map', step1.map);
        var step2 = this.lighter.process(step1.css, {
            from: this.dir + '/a.css',
            to:  'b.css',
            map:  false
        });

        should.not.exists(step2.map);
    });

    it('works in subdirs', () => {
        var result = this.doubler.process('a { }', {
            from: 'from/a.css',
            to:   'out/b.css',
            map:   true
        });

        result.css.should.match(/sourceMappingURL=b.css.map/);

        var map = consumer(result.map);
        map.file.should.eql('b.css');
        map.sources.should.eql(['../from/a.css']);
    });

    it('uses map from subdir', () => {
        var step1 = this.doubler.process('a { }', {
            from: 'a.css',
            to:   'out/b.css',
            map:   true
        });

        var step2 = this.doubler.process(step1.css, {
            from: 'out/b.css',
            to:   'out/two/c.css',
            map: { prev: step1.map }
        });

        consumer(step2.map).originalPositionFor({ line: 1, column: 0 })
            .source.should.eql('../../a.css');

        var step3 = this.doubler.process(step2.css, {
            from: 'c.css',
            to:   'd.css',
            map: { prev: step2.map }
        });

        consumer(step3.map).originalPositionFor({ line: 1, column: 0 })
            .source.should.eql('../../a.css');
    });

    it('uses map from subdir if it inlined', () => {
        var step1 = this.doubler.process('a { }', {
            from: 'a.css',
            to:   'out/b.css',
            map: { inline: true }
        });

        var step2 = this.doubler.process(step1.css, {
            from: 'out/b.css',
            to:   'out/two/c.css',
            map: { inline: false }
        });

        consumer(step2.map).originalPositionFor({ line: 1, column: 0 })
          .source.should.eql('../../a.css');
    });

    it('uses map from subdir if it written as a file', () => {
        var step1 = this.doubler.process('a { }', {
            from: 'source/a.css',
            to:   'one/b.css',
            map: { annotation: 'maps/b.css.map' }
        });

        consumer(step1.map).originalPositionFor({ line: 1, column: 0 })
            .source.should.eql('../../source/a.css');

        fs.outputFileSync(this.dir + '/one/maps/b.css.map', step1.map);

        var step2 = this.doubler.process(step1.css, {
            from: this.dir + '/one/b.css',
            to:   this.dir + '/two/c.css',
            map:  true
        });

        consumer(step2.map).originalPositionFor({ line: 1, column: 0 })
            .source.should.eql('../source/a.css');
    });

    it('works with different types of maps', () => {
        var step1 = this.doubler.process('a { }', {
            from: 'a.css',
            to:   'b.css',
            map:  true
        });

        var map  = step1.map;
        var maps = [map, consumer(map), map.toJSON(), map.toString()];

        for ( var i of maps ) {
            var step2 = this.doubler.process(step1.css, {
                from: 'b.css',
                to:   'c.css',
                map: { prev: i }
            });
            consumer(step2.map).originalPositionFor({ line: 1, column: 0 })
                .source.should.eql('a.css');
        }
    });

    it('sets source content on request', () => {
        var result = this.doubler.process('a { }', {
            from: 'a.css',
            to:   'out/b.css',
            map: { sourcesContent: true }
        });

        consumer(result.map).sourceContentFor('../a.css').should.eql('a { }');
    });

    it('sets source content if previous have', () => {
        var step1 = this.doubler.process('a { }', {
          from: 'a.css',
          to:   'out/a.css',
          map: { sourcesContent: true }
        });

        var file1 = postcss.parse(step1.css, {
            from: 'a.css',
            map: { prev: step1.map }
        });
        var file2 = postcss.parse('b { }', { from: 'b.css' });

        file2.append( file1.rules[0].clone() );
        var step2 = file2.toResult({ to: 'c.css' });

        consumer(step2.map).sourceContentFor('b.css').should.eql('b { }');
    });

    it('miss source content on request', () => {
        var step1 = this.doubler.process('a { }', {
            from: 'a.css',
            to:   'out/a.css',
            map: { sourcesContent: true }
        });

        var file1 = postcss.parse(step1.css, {
            from: 'a.css',
            map: { prev: step1.map }
        });
        var file2 = postcss.parse('b { }', { from: 'b.css' });

        file2.append( file1.rules[0].clone() );
        var step2 = file2.toResult({
            to: 'c.css',
            map: { sourcesContent: false }
        });

        var map = consumer(step2.map);
        should.not.exists(map.sourceContentFor('b.css'));
        should.not.exists(map.sourceContentFor('../a.css'));
    });

    it('works without file names for inline maps', () => {
        var step1 = this.doubler.process('a { }', { map: 'inline' });
        var step2 = this.doubler.process(step1.css);
        postcss.parse(step2.css).prevMap.file.should.match(/^\d+$/);
    });

    it('supports UTF-8', () => {
        var step1 = this.doubler.process('a { }', {
            from: 'вход.css',
            to:   'шаг1.css',
            map:  'inline'
        });
        var step2 = this.doubler.process(step1.css, {
            from: 'шаг1.css',
            to:   'выход.css',
        });

        var map = postcss.parse(step2.css).prevMap.consumer();
        map.file.should.eql('выход.css');
    });

});
