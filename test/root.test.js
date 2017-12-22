'use strict';

const Result = require('../lib/result');
const parse  = require('../lib/parse');

it('prepend() fixes spaces on insert before first', () => {
    let css = parse('a {} b {}');
    css.prepend({ selector: 'em' });
    expect(css.toString()).toEqual('em {} a {} b {}');
});

it('prepend() fixes spaces on multiple inserts before first', () => {
    let css = parse('a {} b {}');
    css.prepend({ selector: 'em' }, { selector: 'strong' });
    expect(css.toString()).toEqual('em {} strong {} a {} b {}');
});

it('prepend() uses default spaces on only first', () => {
    let css = parse('a {}');
    css.prepend({ selector: 'em' });
    expect(css.toString()).toEqual('em {}\na {}');
});

it('append() sets new line between rules in multiline files', () => {
    let a = parse('a {}\n\na {}\n');
    let b = parse('b {}\n');
    expect(a.append(b).toString()).toEqual('a {}\n\na {}\n\nb {}\n');
});

it('insertAfter() does not use before of first rule', () => {
    let css = parse('a{} b{}');
    css.insertAfter(0, { selector: '.a' });
    css.insertAfter(2, { selector: '.b' });

    expect(css.nodes[1].raws.before).not.toBeDefined();
    expect(css.nodes[3].raws.before).toEqual(' ');
    expect(css.toString()).toEqual('a{} .a{} b{} .b{}');
});

it('fixes spaces on removing first rule', () => {
    let css = parse('a{}\nb{}\n');
    css.first.remove();
    expect(css.toString()).toEqual('b{}\n');
});

it('keeps spaces on moving root', () => {
    let css1 = parse('a{}\nb{}\n');

    let css2 = parse('');
    css2.append(css1);
    expect(css2.toString()).toEqual('a{}\nb{}');

    let css3 = parse('\n');
    css3.append(css2.nodes);
    expect(css3.toString()).toEqual('a{}\nb{}\n');
});

it('generates result with map', () => {
    let root   = parse('a {}');
    let result = root.toResult({ map: true });

    expect(result instanceof Result).toBeTruthy();
    expect(result.css).toMatch(/a \{\}\n\/\*# sourceMappingURL=/);
});
