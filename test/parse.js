import parse from '../lib/parse';
import Root  from '../lib/root';

import cases from 'postcss-parser-tests';
import path  from 'path';
import test  from 'ava';
import fs    from 'fs';

test('works with file reads', t => {
    let stream = fs.readFileSync(cases.path('atrule-empty.css'));
    t.truthy(parse(stream) instanceof Root);
});

cases.each( (name, css, json) => {
    test('parses ' + name, t => {
        let parsed = cases.jsonify(parse(css, { from: name }));
        t.deepEqual(parsed, json);
    });
});

test('saves source file', t => {
    let css = parse('a {}', { from: 'a.css' });
    t.deepEqual(css.first.source.input.css, 'a {}');
    t.deepEqual(css.first.source.input.file, path.resolve('a.css'));
    t.deepEqual(css.first.source.input.from, path.resolve('a.css'));
});

test('keeps absolute path in source', t => {
    let css = parse('a {}', { from: 'http://example.com/a.css' });
    t.deepEqual(css.first.source.input.file, 'http://example.com/a.css');
    t.deepEqual(css.first.source.input.from, 'http://example.com/a.css');
});

test('saves source file on previous map', t => {
    let root1 = parse('a {}', { map: { inline: true } });
    let css   = root1.toResult({ map: { inline: true } }).css;
    let root2 = parse(css);
    t.deepEqual(root2.first.source.input.file, path.resolve('to.css'));
});

test('sets unique ID for file without name', t => {
    let css1 = parse('a {}');
    let css2 = parse('a {}');
    t.regex(css1.first.source.input.id,   /^<input css \d+>$/);
    t.regex(css1.first.source.input.from, /^<input css \d+>$/);
    t.notDeepEqual(css2.first.source.input.id, css1.first.source.input.id);
});

test('sets parent node', t => {
    let file = cases.path('atrule-rules.css');
    let css  = parse(fs.readFileSync(file));

    let support   = css.first;
    let keyframes = support.first;
    let from      = keyframes.first;
    let decl      = from.first;

    t.is(decl.parent,      from);
    t.is(from.parent,      keyframes);
    t.is(support.parent,   css);
    t.is(keyframes.parent, support);
});

test('ignores wrong close bracket', t => {
    let root = parse('a { p: ()) }');
    t.deepEqual(root.first.first.value, '())');
});

test('ignores symbols before declaration', t => {
    let root = parse('a { :one: 1 }');
    t.deepEqual(root.first.first.raws.before, ' :');
});

test('throws on unclosed blocks', t => {
    t.throws(() => {
        parse('\na {\n');
    }, /:2:1: Unclosed block/);
});

test('throws on unnecessary block close', t => {
    t.throws(() => {
        parse('a {\n} }');
    }, /:2:3: Unexpected }/);
});

test('throws on unclosed comment', t => {
    t.throws(() => {
        parse('\n/*\n ');
    }, /:2:1: Unclosed comment/);
});

test('throws on unclosed quote', t => {
    t.throws(() => {
        parse('\n"\n\na ');
    }, /:2:1: Unclosed string/);
});

test('throws on unclosed bracket', t => {
    t.throws(() => {
        parse(':not(one() { }');
    }, /:1:5: Unclosed bracket/);
});

test('throws on property without value', t => {
    t.throws(() => {
        parse('a { b;}');
    }, /:1:5: Unknown word/);
    t.throws(() => {
        parse('a { b b }');
    }, /:1:5: Unknown word/);
});

test('throws on nameless at-rule', t => {
    t.throws(() => {
        parse('@');
    }, /:1:1: At-rule without name/);
});

test('throws on property without semicolon', t => {
    t.throws(() => {
        parse('a { one: filter(a:"") two: 2 }');
    }, /:1:21: Missed semicolon/);
});

test('throws on double colon', t => {
    t.throws(() => {
        parse('a { one:: 1 }');
    }, /:1:9: Double colon/);
});

test('does not suggest different parsers for CSS', t => {
    let error;
    try {
        parse('a { one:: 1 }', { from: 'app.css' });
    } catch (e) {
        error = e;
    }
    t.notRegex(error.message, /postcss-less|postcss-scss/);
});

test('suggests postcss-scss for SCSS sources', t => {
    t.throws(() => {
        parse('a { #{var}: 1 }', { from: 'app.scss' });
    }, /postcss-scss/);
});

test('suggests postcss-less for Less sources', t => {
    t.throws(() => {
        parse('.@{my-selector} { }', { from: 'app.less' });
    }, /postcss-less/);
});
