import PreviousMap from '../lib/previous-map';
import postcss     from '../lib/postcss';

import   mozilla  from 'source-map';
import   fs       from 'fs-extra';
import { expect } from 'chai';
import   path     from 'path';

let consumer = map => mozilla.SourceMapConsumer.fromSourceMap(map);

let read = function (result) {
    let prev = new PreviousMap(result.css, { });
    return prev.consumer();
};

let dir = path.join(__dirname, 'fixtures');

let doubler = postcss( (css) => {
    css.eachDecl( decl => decl.parent.prepend(decl.clone()) );
});
let lighter = postcss( (css) => {
    css.eachDecl( decl => decl.value = 'white' );
});

describe('source maps', () => {
    afterEach( () => {
        if ( fs.existsSync(dir) ) fs.removeSync(dir);
    });

    it('adds map field only on request', () => {
        expect(postcss().process('a {}').map).to.not.exist;
    });

    it('return map generator', () => {
        let map = postcss().process('a {}', { map: { inline: false } }).map;
        expect(map).to.be.instanceOf(mozilla.SourceMapGenerator);
    });

    it('generate right source map', () => {
        let css       = 'a {\n  color: black;\n  }';
        let processor = postcss( (root) => {
            root.eachRule( (rule) => {
                rule.selector = 'strong';
            });
            root.eachDecl( (decl) => {
                decl.parent.prepend( decl.clone({ prop: 'background' }) );
            });
        });

        let result = processor.process(css, {
            from: 'a.css',
            to:   'b.css',
            map:  true
        });
        let map = read(result);

        expect(map.file).to.eql('b.css');

        expect(map.originalPositionFor({ line: 1, column: 0 })).to.eql({
            source: 'a.css',
            line:   1,
            column: 0,
            name:   null
        });
        expect(map.originalPositionFor({ line: 2, column: 2 })).to.eql({
            source: 'a.css',
            line:   2,
            column: 2,
            name:   null
        });
        expect(map.originalPositionFor({ line: 3, column: 2 })).to.eql({
            source: 'a.css',
            line:   2,
            column: 2,
            name:   null
        });
    });

    it('changes previous source map', () => {
        let css = 'a { color: black }';

        let doubled = doubler.process(css, {
            from: 'a.css',
            to:   'b.css',
            map: { inline: false }
        });

        let lighted = lighter.process(doubled.css, {
            from: 'b.css',
            to:   'c.css',
            map: { prev: doubled.map }
        });

        let map = consumer(lighted.map);
        expect(map.originalPositionFor({ line: 1, column: 18 })).to.eql({
            source: 'a.css',
            line:   1,
            column: 4,
            name:   null
        });
    });

    it('adds source map annotation', () => {
        let css    = 'a { }/*# sourceMappingURL=a.css.map */';
        let result = postcss().process(css, {
            from: 'a.css',
            to:   'b.css',
            map: { inline: false }
        });

        expect(result.css).to.eql('a { }\n/*# sourceMappingURL=b.css.map */');
    });

    it('misses source map annotation, if user ask', () => {
        let css    = 'a { }';
        let result = postcss().process(css, {
            from: 'a.css',
            to:   'b.css',
            map: { annotation: false }
        });

        expect(result.css).to.eql(css);
    });

    it('misses source map annotation, if previous map missed it', () => {
        let css = 'a { }';

        let step1 = postcss().process(css, {
            from: 'a.css',
            to:   'b.css',
            map: { annotation: false }
        });

        let step2 = postcss().process(step1.css, {
            from: 'b.css',
            to:   'c.css',
            map: { prev: step1.map }
        });

        expect(step2.css).to.eql(css);
    });

    it('uses user path in annotation, relative to options.to', () => {
        let result = postcss().process('a { }', {
            from: 'source/a.css',
            to:   'build/b.css',
            map: { annotation: 'maps/b.map' }
        });

        expect(result.css).to.eql('a { }\n/*# sourceMappingURL=maps/b.map */');
        let map = consumer(result.map);

        expect(map.file).to.eql('../b.css');
        expect(map.originalPositionFor({ line: 1, column: 0 }).source)
            .to.eql('../../source/a.css');
    });

    it('generates inline map', () => {
        let css = 'a { }';

        let inline = postcss().process(css, {
            from: 'a.css',
            to:   'b.css',
            map: { inline: true }
        });

        expect(inline.map).to.not.exist;
        expect(inline.css).to.match(/# sourceMappingURL=data:/);

        let separated = postcss().process(css, {
          from: 'a.css',
          to:   'b.css',
          map: { inline: false }
        });

        let base64 = new Buffer(separated.map).toString('base64');
        expect(inline.css.endsWith(base64 + ' */')).to.be.true;
    });

    it('generates inline map by default', () => {
        let inline = postcss().process('a { }', {
            from: 'a.css',
            to:   'b.css',
            map:   true
        });

        expect(inline.css).to.match(/# sourceMappingURL=data:/);
    });

    it('generates separated map if previous map was not inlined', () => {
        let step1 = doubler.process('a { color: black }', {
            from: 'a.css',
            to:   'b.css',
            map: { inline: false }
        });
        let step2 = lighter.process(step1.css, {
            from: 'b.css',
            to:   'c.css',
            map: { prev: step1.map }
        });

        expect(step2.map).to.exist;
    });

    it('generates separated map on annotation option', () => {
        let result = postcss().process('a { }', {
            from: 'a.css',
            to:   'b.css',
            map: { annotation: false }
        });

        expect(result.map).to.exist;
    });

    it('allows change map type', () => {
        let step1 = postcss().process('a { }', {
            from: 'a.css',
            to:   'b.css',
            map: { inline: true }
        });

        let step2 = postcss().process(step1.css, {
            from: 'b.css',
            to:   'c.css',
            map: { inline: false }
        });

        expect(step2).to.have.property('map');
        expect(step2.css).to.not.match(/# sourceMappingURL=data:/);
    });

    it('misses check files on requires', () => {
        let file = path.join(dir, 'a.css');

        let step1 = doubler.process('a { }', {
            from: 'a.css',
            to:    file,
            map:   true
        });

        fs.outputFileSync(file + '.map', step1.map);
        let step2 = lighter.process(step1.css, {
            from: file,
            to:  'b.css',
            map:  false
        });

        expect(step2.map).to.not.exist;
    });

    it('works in subdirs', () => {
        let result = doubler.process('a { }', {
            from: 'from/a.css',
            to:   'out/b.css',
            map: { inline: false }
        });

        expect(result.css).to.match(/sourceMappingURL=b.css.map/);

        let map = consumer(result.map);
        expect(map.file).to.eql('b.css');
        expect(map.sources).to.eql(['../from/a.css']);
    });

    it('uses map from subdir', () => {
        let step1 = doubler.process('a { }', {
            from: 'a.css',
            to:   'out/b.css',
            map: { inline: false }
        });

        let step2 = doubler.process(step1.css, {
            from: 'out/b.css',
            to:   'out/two/c.css',
            map: { prev: step1.map }
        });

        let source = consumer(step2.map)
            .originalPositionFor({ line: 1, column: 0 }).source;
        expect(source).to.eql('../../a.css');

        let step3 = doubler.process(step2.css, {
            from: 'c.css',
            to:   'd.css',
            map: { prev: step2.map }
        });

        source = consumer(step3.map)
            .originalPositionFor({ line: 1, column: 0 }).source;
        expect(source).to.eql('../../a.css');
    });

    it('uses map from subdir if it inlined', () => {
        let step1 = doubler.process('a { }', {
            from: 'a.css',
            to:   'out/b.css',
            map:   true
        });

        let step2 = doubler.process(step1.css, {
            from: 'out/b.css',
            to:   'out/two/c.css',
            map: { inline: false }
        });

        let source = consumer(step2.map)
            .originalPositionFor({ line: 1, column: 0 }).source;
        expect(source).to.eql('../../a.css');
    });

    it('uses map from subdir if it written as a file', () => {
        let step1 = doubler.process('a { }', {
            from: 'source/a.css',
            to:   'one/b.css',
            map: { annotation: 'maps/b.css.map', inline: false }
        });

        let source = consumer(step1.map)
            .originalPositionFor({ line: 1, column: 0 }).source;
        expect(source).to.eql('../../source/a.css');

        let file = path.join(dir, 'one', 'maps', 'b.css.map');
        fs.outputFileSync(file, step1.map);

        let step2 = doubler.process(step1.css, {
            from: path.join(dir, 'one', 'b.css'),
            to:   path.join(dir, 'two', 'c.css'),
            map:  true
        });

        source = consumer(step2.map)
            .originalPositionFor({ line: 1, column: 0 }).source;
        expect(source).to.eql('../source/a.css');
    });

    it('works with different types of maps', () => {
        let step1 = doubler.process('a { }', {
            from: 'a.css',
            to:   'b.css',
            map: { inline: false }
        });

        let map  = step1.map;
        let maps = [map, consumer(map), map.toJSON(), map.toString()];

        for ( let i of maps ) {
            let step2 = doubler.process(step1.css, {
                from: 'b.css',
                to:   'c.css',
                map: { prev: i }
            });
            let source = consumer(step2.map)
                .originalPositionFor({ line: 1, column: 0 }).source;
            expect(source).to.eql('a.css');
        }
    });

    it('sets source content by default', () => {
        let result = doubler.process('a { }', {
            from: 'a.css',
            to:   'out/b.css',
            map:   true
        });

        expect(read(result).sourceContentFor('../a.css')).to.eql('a { }');
    });

    it('misses source content on request', () => {
        let result = doubler.process('a { }', {
            from: 'a.css',
            to:   'out/b.css',
            map: { sourcesContent: false }
        });

        expect(read(result).sourceContentFor('../a.css')).to.not.exist;
    });

    it('misses source content if previous not have', () => {
        let step1 = doubler.process('a { }', {
          from: 'a.css',
          to:   'out/a.css',
          map: { sourcesContent: false }
        });

        let file1 = postcss.parse(step1.css, {
            from: 'a.css',
            map: { prev: step1.map }
        });
        let file2 = postcss.parse('b { }', { from: 'b.css', map: true });

        file2.append( file1.first.clone() );
        let step2 = file2.toResult({ to: 'c.css', map: true });

        expect(read(step2).sourceContentFor('b.css')).to.not.exist;
    });

    it('misses source content on request', () => {
        let step1 = doubler.process('a { }', {
            from: 'a.css',
            to:   'out/a.css',
            map: { sourcesContent: true }
        });

        let file1 = postcss.parse(step1.css, {
            from: 'a.css',
            map: { prev: step1.map }
        });
        let file2 = postcss.parse('b { }', { from: 'b.css', map: true });

        file2.append( file1.first.clone() );
        let step2 = file2.toResult({
            to:   'c.css',
            map: { sourcesContent: false }
        });

        let map = read(step2);
        expect(map.sourceContentFor('b.css')).to.not.exist;
        expect(map.sourceContentFor('../a.css')).to.not.exist;
    });

    it('detects input file name from map', () => {
        let one = doubler.process('a { }', { to: 'a.css', map: true });
        let two = doubler.process(one.css, { map: { prev: one.map } });
        expect(two.root.first.source.input.file).to.eql(path.resolve('a.css'));
    });

    it('works without file names', () => {
        let step1 = doubler.process('a { }', { map: true });
        let step2 = doubler.process(step1.css);
        expect(step2.css).to.match(/a \{ \}\n\/\*/);
    });

    it('supports UTF-8', () => {
        let step1 = doubler.process('a { }', {
            from: 'вход.css',
            to:   'шаг1.css',
            map:   true
        });
        let step2 = doubler.process(step1.css, {
            from: 'шаг1.css',
            to:   'выход.css'
        });

        expect(read(step2).file).to.eql('выход.css');
    });

    it('generates map for node created manually', () => {
        let contenter = postcss( (css) => {
            css.first.prepend({ prop: 'content', value: '""' });
        });
        let result = contenter.process('a:after{\n}', { map: true });
        expect(read(result).originalPositionFor({ line: 2, column: 0 }))
            .to.eql({ source: null, line: null, column: null, name: null });
    });

    it('uses input file name as output file name', () => {
        let result = doubler.process('a{}', {
            from: 'a.css',
            map: { inline: false }
        });
        expect(result.map.toJSON().file).to.eql('a.css');
    });

    it('uses to.css as default output name', () => {
        let result = doubler.process('a{}', { map: { inline: false } });
        expect(result.map.toJSON().file).to.eql('to.css');
    });

    it('supports annotation comment in any place', () => {
        let css    = '/*# sourceMappingURL=a.css.map */a { }';
        let result = postcss().process(css, {
            from: 'a.css',
            to:   'b.css',
            map: { inline: false }
        });

        expect(result.css).to.eql('a { }\n/*# sourceMappingURL=b.css.map */');
    });

    it('does not update annotation on request', () => {
        let css    = 'a { }/*# sourceMappingURL=a.css.map */';
        let result = postcss().process(css, {
            from: 'a.css',
            to:   'b.css',
            map: { annotation: false, inline: false }
        });

        expect(result.css).to.eql('a { }/*# sourceMappingURL=a.css.map */');
    });

});
