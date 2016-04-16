import parse from '../lib/parse';

import mozilla from 'source-map';
import path    from 'path';
import test    from 'ava';
import fs      from 'fs-extra';

let dir = path.join(__dirname, 'prevmap-fixtures');
let mapObj = {
    version:  3,
    file:     null,
    sources:  [],
    names:    [],
    mappings: ''
};
let map = JSON.stringify(mapObj);

test.afterEach( () => {
    if ( fs.existsSync(dir) ) fs.removeSync(dir);
});

test('misses property if no map', t => {
    t.deepEqual(typeof parse('a{}').source.input.map, 'undefined');
});

test('creates property if map present', t => {
    let root = parse('a{}', { map: { prev: map } });
    t.deepEqual(root.source.input.map.text, map);
});

test('returns consumer', t => {
    let obj = parse('a{}', { map: { prev: map } }).source.input.map.consumer();
    t.truthy(obj instanceof mozilla.SourceMapConsumer);
});

test('sets annotation property', t => {
    let mapOpts = { map: { prev: map } };

    let root1 = parse('a{}', mapOpts);
    t.deepEqual(typeof root1.source.input.map.annotation, 'undefined');

    let root2 = parse('a{}/*# sourceMappingURL=a.css.map */', mapOpts);
    t.deepEqual(root2.source.input.map.annotation, 'a.css.map');
});

test('checks previous sources content', t => {
    let map2 = {
        version:  3,
        file:     'b',
        sources:  ['a'],
        names:    [],
        mappings: ''
    };

    let opts = { map: { prev: map2 } };
    t.false(parse('a{}', opts).source.input.map.withContent());

    map2.sourcesContent = ['a{}'];
    t.true(parse('a{}', opts).source.input.map.withContent());
});

test('decodes base64 maps', t => {
    let b64 = new Buffer(map).toString('base64');
    let css = 'a{}\n' +
              `/*# sourceMappingURL=data:application/json;base64,${b64} */`;

    t.deepEqual(parse(css).source.input.map.text, map);
});

test('decodes base64 UTF-8 maps', t => {
    let b64 = new Buffer(map).toString('base64');
    let css = 'a{}\n/*# sourceMappingURL=data:application/json;' +
              'charset=utf-8;base64,' + b64 + ' */';

    t.deepEqual(parse(css).source.input.map.text, map);
});

test('accepts different name for UTF-8 encoding', t => {
    let b64 = new Buffer(map).toString('base64');
    let css = 'a{}\n/*# sourceMappingURL=data:application/json;' +
              'charset=utf8;base64,' + b64 + ' */';

    t.deepEqual(parse(css).source.input.map.text, map);
});

test('decodes URI maps', t => {
    let uri = 'data:application/json,' + decodeURI(map);
    let css = `a{}\n/*# sourceMappingURL=${ uri } */`;

    t.deepEqual(parse(css).source.input.map.text, map);
});

test('removes map on request', t => {
    let uri = 'data:application/json,' + decodeURI(map);
    let css = `a{}\n/*# sourceMappingURL=${ uri } */`;

    let input = parse(css, { map: { prev: false } }).source.input;
    t.deepEqual(typeof input.map, 'undefined');
});

test('raises on unknown inline encoding', t => {
    let css = 'a { }\n/*# sourceMappingURL=data:application/json;' +
              'md5,68b329da9893e34099c7d8ad5cb9c940*/';

    t.throws( () => {
        parse(css);
    }, 'Unsupported source map encoding md5');
});

test('raises on unknown map format', t => {
    t.throws( () => {
        parse('a{}', { map: { prev: 1 } });
    }, 'Unsupported previous source map format: 1');
});

test('reads map from annotation', t => {
    let file = path.join(dir, 'a.map');
    fs.outputFileSync(file, map);
    let root = parse('a{}\n/*# sourceMappingURL=a.map */', { from: file });

    t.deepEqual(root.source.input.map.text, map);
    t.deepEqual(root.source.input.map.root, dir);
});

test('sets uniq name for inline map', t => {
    let map2 = {
        version:  3,
        sources:  ['a'],
        names:    [],
        mappings: ''
    };

    let opts  = { map: { prev: map2 } };
    let file1 = parse('a{}', opts).source.input.map.file;
    let file2 = parse('a{}', opts).source.input.map.file;

    t.regex(file1, /^<input css \d+>$/);
    t.notDeepEqual(file1, file2);
});

test('should accept an empty mappings string', () => {
    let emptyMap = {
        version:  3,
        sources:  [],
        names:    [],
        mappings: ''
    };
    parse('body{}', { map: { prev: emptyMap } } );
});

test('should accept a function', t => {
    let css  = 'body{}\n/*# sourceMappingURL=a.map */';
    let file = path.join(dir, 'previous-sourcemap-function.map');
    fs.outputFileSync(file, map);
    let opts = {
        map: {
            prev: (/* from */) => file
        }
    };
    let root = parse(css, opts);
    t.deepEqual(root.source.input.map.text, map);
    t.deepEqual(root.source.input.map.annotation, 'a.map');
});

test('should call function with opts.from', t => {
    t.plan(1);

    let css  = 'body{}\n/*# sourceMappingURL=a.map */';
    let file = path.join(dir, 'previous-sourcemap-function.map');
    fs.outputFileSync(file, map);
    let opts = {
        from: 'a.css',
        map:  {
            prev: from => {
                t.deepEqual(from, 'a.css');
                return file;
            }
        }
    };
    parse(css, opts);
});

test('should raise when function returns invalid path', t => {
    let css = 'body{}\n/*# sourceMappingURL=a.map */';
    let fakeMap  = Number.MAX_SAFE_INTEGER.toString() + '.map';
    let fakePath = path.join(dir, fakeMap);
    let opts = {
        map: {
            prev: () => fakePath
        }
    };
    t.throws( () => {
        parse(css, opts);
    }, 'Unable to load previous source map: ' + fakePath);
});
