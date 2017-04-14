import Result from '../lib/result';
import parse  from '../lib/parse';

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

it('append() sets new line between rules on last newline', () => {
    let a = parse('a {}\n');
    let b = parse('b {}\n');
    expect(a.append(b).toString()).toEqual('a {}\nb {}\n');
});

it('append() saves compressed style', () => {
    let a = parse('a{}a{}');
    let b = parse('b {\n}\n');
    expect(a.append(b).toString()).toEqual('a{}a{}b{}');
});

it('append() saves compressed style with multiple nodes', () => {
    let a = parse('a{}a{}');
    let b = parse('b {\n}\n');
    let c = parse('c {\n}\n');
    expect(a.append(b, c).toString()).toEqual('a{}a{}b{}c{}');
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

it('generates result with map', () => {
    let root   = parse('a {}');
    let result = root.toResult({ map: true });

    expect(result instanceof Result).toBeTruthy();
    expect(result.css).toMatch(/a \{\}\n\/\*# sourceMappingURL=/);
});
