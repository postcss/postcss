import PreviousMap from '../lib/previous-map';
import postcss     from '../lib/postcss';

import mozilla from 'source-map';
import path    from 'path';
import test    from 'ava';
import fs      from 'fs-extra';

let consumer = map => mozilla.SourceMapConsumer.fromSourceMap(map);

function read(result) {
    let prev = new PreviousMap(result.css, { });
    return prev.consumer();
}

let dir = path.join(__dirname, 'map-fixtures');

let doubler = postcss( css => {
    css.walkDecls( decl => decl.parent.prepend(decl.clone()) );
});
let lighter = postcss( css => {
    css.walkDecls( decl => {
        decl.value = 'white';
    });
});

test.afterEach( () => {
    if ( fs.existsSync(dir) ) fs.removeSync(dir);
});

test('adds map field only on request', t => {
    t.deepEqual(typeof postcss().process('a {}').map, 'undefined');
});

test('return map generator', t => {
    let map = postcss().process('a {}', { map: { inline: false } }).map;
    t.truthy(map instanceof mozilla.SourceMapGenerator);
});

test('generate right source map', t => {
    let css       = 'a {\n  color: black;\n  }';
    let processor = postcss( root => {
        root.walkRules( rule => {
            rule.selector = 'strong';
        });
        root.walkDecls( decl => {
            decl.parent.prepend( decl.clone({ prop: 'background' }) );
        });
    });

    let result = processor.process(css, {
        from: 'a.css',
        to:   'b.css',
        map:  true
    });
    let map = read(result);

    t.deepEqual(map.file, 'b.css');

    t.deepEqual(map.originalPositionFor({ line: 1, column: 0 }), {
        source: 'a.css',
        line:   1,
        column: 0,
        name:   null
    });
    t.deepEqual(map.originalPositionFor({ line: 2, column: 2 }), {
        source: 'a.css',
        line:   2,
        column: 2,
        name:   null
    });
    t.deepEqual(map.originalPositionFor({ line: 3, column: 2 }), {
        source: 'a.css',
        line:   2,
        column: 2,
        name:   null
    });
});

test('changes previous source map', t => {
    let css = 'a { color: black }';

    let doubled = doubler.process(css, {
        from: 'a.css',
        to:   'b.css',
        map:  { inline: false }
    });

    let lighted = lighter.process(doubled.css, {
        from: 'b.css',
        to:   'c.css',
        map:  { prev: doubled.map }
    });

    let map = consumer(lighted.map);
    t.deepEqual(map.originalPositionFor({ line: 1, column: 18 }), {
        source: 'a.css',
        line:   1,
        column: 4,
        name:   null
    });
});

test('adds source map annotation', t => {
    let css    = 'a { }/*# sourceMappingURL=a.css.map */';
    let result = postcss().process(css, {
        from: 'a.css',
        to:   'b.css',
        map:  { inline: false }
    });

    t.deepEqual(result.css, 'a { }\n/*# sourceMappingURL=b.css.map */');
});

test('misses source map annotation, if user ask', t => {
    let css    = 'a { }';
    let result = postcss().process(css, {
        from: 'a.css',
        to:   'b.css',
        map:  { annotation: false }
    });

    t.deepEqual(result.css, css);
});

test('misses source map annotation, if previous map missed it', t => {
    let css = 'a { }';

    let step1 = postcss().process(css, {
        from: 'a.css',
        to:   'b.css',
        map:  { annotation: false }
    });

    let step2 = postcss().process(step1.css, {
        from: 'b.css',
        to:   'c.css',
        map:  { prev: step1.map }
    });

    t.deepEqual(step2.css, css);
});

test('uses user path in annotation, relative to options.to', t => {
    let result = postcss().process('a { }', {
        from: 'source/a.css',
        to:   'build/b.css',
        map:  { annotation: 'maps/b.map' }
    });

    t.deepEqual(result.css, 'a { }\n/*# sourceMappingURL=maps/b.map */');
    let map = consumer(result.map);

    t.deepEqual(map.file, '../b.css');
    t.deepEqual(map.originalPositionFor({ line: 1, column: 0 }).source,
                '../../source/a.css');
});

test('generates inline map', t => {
    let css = 'a { }';

    let inline = postcss().process(css, {
        from: 'a.css',
        to:   'b.css',
        map:  { inline: true }
    });

    t.deepEqual(typeof inline.map, 'undefined');
    t.regex(inline.css, /# sourceMappingURL=data:/);

    let separated = postcss().process(css, {
        from: 'a.css',
        to:   'b.css',
        map:  { inline: false }
    });

    let base64 = new Buffer(separated.map.toString()).toString('base64');
    let end    = inline.css.slice(-base64.length - 3);
    t.deepEqual(end, base64 + ' */');
});

test('generates inline map by default', t => {
    let inline = postcss().process('a { }', {
        from: 'a.css',
        to:   'b.css',
        map:  true
    });
    t.regex(inline.css, /# sourceMappingURL=data:/);
});

test('generates separated map if previous map was not inlined', t => {
    let step1 = doubler.process('a { color: black }', {
        from: 'a.css',
        to:   'b.css',
        map:  { inline: false }
    });
    let step2 = lighter.process(step1.css, {
        from: 'b.css',
        to:   'c.css',
        map:  { prev: step1.map }
    });

    t.deepEqual(typeof step2.map, 'object');
});

test('generates separated map on annotation option', t => {
    let result = postcss().process('a { }', {
        from: 'a.css',
        to:   'b.css',
        map:  { annotation: false }
    });

    t.deepEqual(typeof result.map, 'object');
});

test('allows change map type', t => {
    let step1 = postcss().process('a { }', {
        from: 'a.css',
        to:   'b.css',
        map:  { inline: true }
    });

    let step2 = postcss().process(step1.css, {
        from: 'b.css',
        to:   'c.css',
        map:  { inline: false }
    });

    t.deepEqual(typeof step2.map, 'object');
    t.regex(step2.css, /# sourceMappingURL=c\.css\.map/);
});

test('misses check files on requires', t => {
    let file = path.join(dir, 'a.css');

    let step1 = doubler.process('a { }', {
        from: 'a.css',
        to:   file,
        map:  true
    });

    fs.outputFileSync(file + '.map', step1.map);
    let step2 = lighter.process(step1.css, {
        from: file,
        to:   'b.css',
        map:  false
    });

    t.deepEqual(typeof step2.map, 'undefined');
});

test('works in subdirs', t => {
    let result = doubler.process('a { }', {
        from: 'from/a.css',
        to:   'out/b.css',
        map:  { inline: false }
    });

    t.regex(result.css, /sourceMappingURL=b.css.map/);

    let map = consumer(result.map);
    t.deepEqual(map.file, 'b.css');
    t.deepEqual(map.sources, ['../from/a.css']);
});

test('uses map from subdir', t => {
    let step1 = doubler.process('a { }', {
        from: 'a.css',
        to:   'out/b.css',
        map:  { inline: false }
    });

    let step2 = doubler.process(step1.css, {
        from: 'out/b.css',
        to:   'out/two/c.css',
        map:  { prev: step1.map }
    });

    let source = consumer(step2.map)
        .originalPositionFor({ line: 1, column: 0 }).source;
    t.deepEqual(source, '../../a.css');

    let step3 = doubler.process(step2.css, {
        from: 'c.css',
        to:   'd.css',
        map:  { prev: step2.map }
    });

    source = consumer(step3.map)
        .originalPositionFor({ line: 1, column: 0 }).source;
    t.deepEqual(source, '../../a.css');
});

test('uses map from subdir if it inlined', t => {
    let step1 = doubler.process('a { }', {
        from: 'a.css',
        to:   'out/b.css',
        map:  true
    });

    let step2 = doubler.process(step1.css, {
        from: 'out/b.css',
        to:   'out/two/c.css',
        map:  { inline: false }
    });

    let source = consumer(step2.map)
        .originalPositionFor({ line: 1, column: 0 }).source;
    t.deepEqual(source, '../../a.css');
});

test('uses map from subdir if it written as a file', t => {
    let step1 = doubler.process('a { }', {
        from: 'source/a.css',
        to:   'one/b.css',
        map:  { annotation: 'maps/b.css.map', inline: false }
    });

    let source = consumer(step1.map)
        .originalPositionFor({ line: 1, column: 0 }).source;
    t.deepEqual(source, '../../source/a.css');

    let file = path.join(dir, 'one', 'maps', 'b.css.map');
    fs.outputFileSync(file, step1.map);

    let step2 = doubler.process(step1.css, {
        from: path.join(dir, 'one', 'b.css'),
        to:   path.join(dir, 'two', 'c.css'),
        map:  true
    });

    source = consumer(step2.map)
        .originalPositionFor({ line: 1, column: 0 }).source;
    t.deepEqual(source, '../source/a.css');
});

test('works with different types of maps', t => {
    let step1 = doubler.process('a { }', {
        from: 'a.css',
        to:   'b.css',
        map:  { inline: false }
    });

    let map  = step1.map;
    let maps = [map, consumer(map), map.toJSON(), map.toString()];

    for ( let i of maps ) {
        let step2 = doubler.process(step1.css, {
            from: 'b.css',
            to:   'c.css',
            map:  { prev: i }
        });
        let source = consumer(step2.map)
            .originalPositionFor({ line: 1, column: 0 }).source;
        t.deepEqual(source, 'a.css');
    }
});

test('sets source content by default', t => {
    let result = doubler.process('a { }', {
        from: 'a.css',
        to:   'out/b.css',
        map:  true
    });

    t.deepEqual(read(result).sourceContentFor('../a.css'), 'a { }');
});

test('misses source content on request', t => {
    let result = doubler.process('a { }', {
        from: 'a.css',
        to:   'out/b.css',
        map:  { sourcesContent: false }
    });

    t.is(read(result).sourceContentFor('../a.css'), null);
});

test('misses source content if previous not have', t => {
    let step1 = doubler.process('a { }', {
        from: 'a.css',
        to:   'out/a.css',
        map:  { sourcesContent: false }
    });

    let file1 = postcss.parse(step1.css, {
        from: 'a.css',
        map:  { prev: step1.map }
    });
    let file2 = postcss.parse('b { }', { from: 'b.css', map: true });

    file2.append( file1.first.clone() );
    let step2 = file2.toResult({ to: 'c.css', map: true });

    t.is(read(step2).sourceContentFor('b.css'), null);
});

test('misses source content on request', t => {
    let step1 = doubler.process('a { }', {
        from: 'a.css',
        to:   'out/a.css',
        map:  { sourcesContent: true }
    });

    let file1 = postcss.parse(step1.css, {
        from: 'a.css',
        map:  { prev: step1.map }
    });
    let file2 = postcss.parse('b { }', { from: 'b.css', map: true });

    file2.append( file1.first.clone() );
    let step2 = file2.toResult({
        to:  'c.css',
        map: { sourcesContent: false }
    });

    let map = read(step2);
    t.is(map.sourceContentFor('b.css'),    null);
    t.is(map.sourceContentFor('../a.css'), null);
});

test('detects input file name from map', t => {
    let one = doubler.process('a { }', { to: 'a.css', map: true });
    let two = doubler.process(one.css, { map: { prev: one.map } });
    t.deepEqual(two.root.first.source.input.file, path.resolve('a.css'));
});

test('works without file names', t => {
    let step1 = doubler.process('a { }', { map: true });
    let step2 = doubler.process(step1.css);
    t.regex(step2.css, /a \{ \}\n\/\*/);
});

test('supports UTF-8', t => {
    let step1 = doubler.process('a { }', {
        from: 'вход.css',
        to:   'шаг1.css',
        map:  true
    });
    let step2 = doubler.process(step1.css, {
        from: 'шаг1.css',
        to:   'выход.css'
    });

    t.deepEqual(read(step2).file, 'выход.css');
});

test('generates map for node created manually', t => {
    let contenter = postcss(css => {
        css.first.prepend({ prop: 'content', value: '""' });
    });
    let result = contenter.process('a:after{\n}', { map: true });
    let map    = read(result);
    t.deepEqual(map.originalPositionFor({ line: 2, column: 5 }), {
        source: '<no source>',
        column: 0,
        line:   1,
        name:   null
    });
});

test('uses input file name as output file name', t => {
    let result = doubler.process('a{}', {
        from: 'a.css',
        map:  { inline: false }
    });
    t.deepEqual(result.map.toJSON().file, 'a.css');
});

test('uses to.css as default output name', t => {
    let result = doubler.process('a{}', { map: { inline: false } });
    t.deepEqual(result.map.toJSON().file, 'to.css');
});

test('supports annotation comment in any place', t => {
    let css    = '/*# sourceMappingURL=a.css.map */a { }';
    let result = postcss().process(css, {
        from: 'a.css',
        to:   'b.css',
        map:  { inline: false }
    });

    t.deepEqual(result.css, 'a { }\n/*# sourceMappingURL=b.css.map */');
});

test('does not update annotation on request', t => {
    let css    = 'a { }/*# sourceMappingURL=a.css.map */';
    let result = postcss().process(css, {
        from: 'a.css',
        to:   'b.css',
        map:  { annotation: false, inline: false }
    });

    t.deepEqual(result.css, 'a { }/*# sourceMappingURL=a.css.map */');
});

test('clears source map', t => {
    let css1 = postcss.root().toResult({ map: true }).css;
    let css2 = postcss.root().toResult({ map: true }).css;

    let root = postcss.root();
    root.append(css1);
    root.append(css2);

    let css = root.toResult({ map: true }).css;
    t.deepEqual(css.match(/sourceMappingURL/g).length, 1);
});

test('uses Windows line separation too', t => {
    let result = postcss().process('a {\r\n}', { map: true });
    t.regex(result.css, /a \{\r\n\}\r\n\/\*# sourceMappingURL=/);
});


test('`map.from` should override the source map sources', t => {
    let result = postcss().process('a{}', {
        map: {
            inline: false,
            from:   'file:///dir/a.css'
        }
    });
    t.deepEqual(result.map.toJSON().sources, ['file:///dir/a.css']);
});

test('preserves absolute urls in `to`', t => {
    let result = postcss().process('a{}', {
        from: '/dir/to/a.css',
        to:   'http://example.com/a.css',
        map:  { inline: false }
    });
    t.deepEqual(result.map.toJSON().file, 'http://example.com/a.css');
});

test('preserves absolute urls in sources', t => {
    let result = postcss().process('a{}', {
        from: 'file:///dir/a.css',
        to:   'http://example.com/a.css',
        map:  { inline: false }
    });
    t.deepEqual(result.map.toJSON().sources, ['file:///dir/a.css']);
});

test('preserves absolute urls in sources from previous map', t => {
    let result1 = postcss().process('a{}', {
        from: 'http://example.com/a.css',
        to:   'http://example.com/b.css',
        map:  true
    });
    let result2 = postcss().process(result1.css, {
        to: 'http://example.com/c.css',
        map: {
            inline: false
        }
    });
    t.deepEqual(result2.root.source.input.file, 'http://example.com/b.css');
    t.deepEqual(result2.map.toJSON().sources, ['http://example.com/a.css']);
});
