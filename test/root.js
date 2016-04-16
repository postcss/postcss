import Result from '../lib/result';
import parse  from '../lib/parse';

import test from 'ava';

test('prepend() fixes spaces on insert before first', t => {
    let css = parse('a {} b {}');
    css.prepend({ selector: 'em' });
    t.deepEqual(css.toString(), 'em {} a {} b {}');
});

test('prepend() fixes spaces on multiple inserts before first', t => {
    let css = parse('a {} b {}');
    css.prepend({ selector: 'em' }, { selector: 'strong' });
    t.deepEqual(css.toString(), 'em {} strong {} a {} b {}');
});

test('prepend() uses default spaces on only first', t => {
    let css = parse('a {}');
    css.prepend({ selector: 'em' });
    t.deepEqual(css.toString(), 'em {}\na {}');
});

test('append() sets new line between rules in multiline files', t => {
    let a = parse('a {}\n\na {}\n');
    let b = parse('b {}\n');
    t.deepEqual(a.append(b).toString(), 'a {}\n\na {}\n\nb {}\n');
});

test('append() sets new line between rules on last newline', t => {
    let a = parse('a {}\n');
    let b = parse('b {}\n');
    t.deepEqual(a.append(b).toString(), 'a {}\nb {}\n');
});

test('append() saves compressed style', t => {
    let a = parse('a{}a{}');
    let b = parse('b {\n}\n');
    t.deepEqual(a.append(b).toString(), 'a{}a{}b{}');
});

test('append() saves compressed style with multiple nodes', t => {
    let a = parse('a{}a{}');
    let b = parse('b {\n}\n');
    let c = parse('c {\n}\n');
    t.deepEqual(a.append(b, c).toString(), 'a{}a{}b{}c{}');
});

test('insertAfter() does not use before of first rule', t => {
    let css = parse('a{} b{}');
    css.insertAfter(0, { selector: '.a' });
    css.insertAfter(2, { selector: '.b' });

    t.deepEqual(typeof css.nodes[1].raws.before, 'undefined');
    t.deepEqual(css.nodes[3].raws.before, ' ');
    t.deepEqual(css.toString(), 'a{} .a{} b{} .b{}');
});

test('fixes spaces on removing first rule', t => {
    let css = parse('a{}\nb{}\n');
    css.first.remove();
    t.deepEqual(css.toString(), 'b{}\n');
});

test('generates result with map', t => {
    let root   = parse('a {}');
    let result = root.toResult({ map: true });

    t.truthy(result instanceof Result);
    t.regex(result.css, /a \{\}\n\/\*# sourceMappingURL=/);
});
