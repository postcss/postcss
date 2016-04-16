import Stringifier from '../lib/stringifier';
import Declaration from '../lib/declaration';
import AtRule      from '../lib/at-rule';
import parse       from '../lib/parse';
import Node        from '../lib/node';
import Root        from '../lib/root';
import Rule        from '../lib/rule';

import test from 'ava';

let str;
test.before( () => {
    str = new Stringifier();
});

test('creates trimmed/raw property', t => {
    let b = new Node({ one: 'trim' });
    b.raws.one = { value: 'trim', raw: 'raw' };
    t.deepEqual(str.rawValue(b, 'one'), 'raw');

    b.one = 'trim1';
    t.deepEqual(str.rawValue(b, 'one'), 'trim1');
});

test('works without rawValue magic', t => {
    let b = new Node();
    b.one = '1';
    t.deepEqual(b.one, '1');
    t.deepEqual(str.rawValue(b, 'one'), '1');
});

test('uses node raw', t => {
    let rule = new Rule({ selector: 'a', raws: { between: '\n' } });
    t.deepEqual(str.raw(rule, 'between', 'beforeOpen'), '\n');
});

test('hacks before for nodes without parent', t => {
    let rule = new Rule({ selector: 'a' });
    t.deepEqual(str.raw(rule, 'before'), '');
});

test('hacks before for first node', t => {
    let root = new Root();
    root.append(new Rule({ selector: 'a' }));
    t.deepEqual(str.raw(root.first, 'before'), '');
});

test('hacks before for first decl', t => {
    let decl = new Declaration({ prop: 'color', value: 'black' });
    t.deepEqual(str.raw(decl, 'before'), '');

    let rule = new Rule({ selector: 'a' });
    rule.append(decl);
    t.deepEqual(str.raw(decl, 'before'), '\n    ');
});

test('detects after raw', t => {
    let root = new Root();
    root.append({ selector: 'a', raws: { after: ' ' } });
    root.first.append({ prop: 'color', value: 'black' });
    root.append({ selector: 'a' });
    t.deepEqual(str.raw(root.last, 'after'), ' ');
});

test('uses defaults without parent', t => {
    let rule = new Rule({ selector: 'a' });
    t.deepEqual(str.raw(rule, 'between', 'beforeOpen'), ' ');
});

test('uses defaults for unique node', t => {
    let root = new Root();
    root.append(new Rule({ selector: 'a' }));
    t.deepEqual(str.raw(root.first, 'between', 'beforeOpen'), ' ');
});

test('clones raw from first node', t => {
    let root = new Root();
    root.append( new Rule({ selector: 'a', raws: { between: '' } }) );
    root.append( new Rule({ selector: 'b' }) );

    t.deepEqual(str.raw(root.last, 'between', 'beforeOpen'), '');
});

test('indents by default', t => {
    let root = new Root();
    root.append( new AtRule({ name: 'page' }) );
    root.first.append( new Rule({ selector: 'a' }) );
    root.first.first.append({ prop: 'color', value: 'black' });

    t.deepEqual(root.toString(), '@page {\n' +
                                 '    a {\n' +
                                 '        color: black\n' +
                                 '    }\n' +
                                 '}');
});

test('clones style', t => {
    let compress = parse('@page{ a{ } }');
    let spaces   = parse('@page {\n  a {\n  }\n}');

    compress.first.first.append({ prop: 'color', value: 'black' });
    t.deepEqual(compress.toString(), '@page{ a{ color: black } }');

    spaces.first.first.append({ prop: 'color', value: 'black' });
    t.deepEqual(spaces.toString(), '@page {\n  a {\n    color: black\n  }\n}');
});

test('clones indent', t => {
    let root = parse('a{\n}');
    root.first.append({ text: 'a' });
    root.first.append({ text: 'b', raws: { before: '\n\n ' } });
    t.deepEqual(root.toString(), 'a{\n\n /* a */\n\n /* b */\n}');
});

test('clones declaration before for comment', t => {
    let root = parse('a{\n}');
    root.first.append({ text: 'a' });
    root.first.append({
        prop:  'a',
        value: '1',
        raws:  { before: '\n\n ' }
    });
    t.deepEqual(root.toString(), 'a{\n\n /* a */\n\n a: 1\n}');
});

test('clones indent by types', t => {
    let css = parse('a {\n  color: black\n}\n\nb {\n}');
    css.append(new Rule({ selector: 'em' }));
    css.last.append({ prop: 'z-index', value: '1' });

    t.deepEqual(css.last.raw('before'), '\n\n');
    t.deepEqual(css.last.first.raw('before'), '\n  ');
});

test('clones indent by before and after', t => {
    let css = parse('@page{\n\n a{\n  color: black}}');
    css.first.append(new Rule({ selector: 'b' }));
    css.first.last.append({ prop: 'z-index', value: '1' });

    t.deepEqual(css.first.last.raw('before'), '\n\n ');
    t.deepEqual(css.first.last.raw('after'), '');
});

test('clones semicolon only from rules with children', t => {
    let css = parse('a{}b{one:1;}');
    t.truthy(str.raw(css.first, 'semicolon'));
});

test('clones only spaces in before', t => {
    let css = parse('a{*one:1}');
    css.first.append({ prop: 'two', value: '2' });
    css.append({ name: 'keyframes', params: 'a' });
    css.last.append({ selector: 'from' });
    t.deepEqual(css.toString(), 'a{*one:1;two:2}\n@keyframes a{\nfrom{}}');
});

test('clones only spaces in between', t => {
    let css = parse('a{one/**/:1}');
    css.first.append({ prop: 'two', value: '2' });
    t.deepEqual(css.toString(), 'a{one/**/:1;two:2}');
});

test('uses optional raws.indent', t => {
    let rule = new Rule({ selector: 'a', raws: { indent: ' ' } });
    rule.append({ prop: 'color', value: 'black' });
    t.deepEqual(rule.toString(), 'a {\n color: black\n}');
});
