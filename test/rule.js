import parse from '../lib/parse';
import Rule  from '../lib/rule';

import test from 'ava';

test('initializes with properties', t => {
    let rule = new Rule({ selector: 'a' });
    t.deepEqual(rule.selector, 'a');
});

test('returns array in selectors', t => {
    let rule = new Rule({ selector: 'a,b' });
    t.deepEqual(rule.selectors, ['a', 'b']);
});

test('trims selectors', t => {
    let rule = new Rule({ selector: '.a\n, .b  , .c' });
    t.deepEqual(rule.selectors, ['.a', '.b', '.c']);
});

test('is smart about selectors commas', t => {
    let rule = new Rule({
        selector: '[foo=\'a, b\'], a:-moz-any(:focus, [href*=\',\'])'
    });
    t.deepEqual(rule.selectors, [
        '[foo=\'a, b\']',
        'a:-moz-any(:focus, [href*=\',\'])'
    ]);
});

test('receive array in selectors', t => {
    let rule = new Rule({ selector: 'i, b' });
    rule.selectors = ['em', 'strong'];
    t.deepEqual(rule.selector, 'em, strong');
});

test('saves separator in selectors', t => {
    let rule = new Rule({ selector: 'i,\nb' });
    rule.selectors = ['em', 'strong'];
    t.deepEqual(rule.selector, 'em,\nstrong');
});

test('uses between to detect separator in selectors', t => {
    let rule = new Rule({ selector: 'b', raws: { between: '' } });
    rule.selectors = ['b', 'strong'];
    t.deepEqual(rule.selector, 'b,strong');
});

test('uses space in separator be default in selectors', t => {
    let rule = new Rule({ selector: 'b' });
    rule.selectors = ['b', 'strong'];
    t.deepEqual(rule.selector, 'b, strong');
});

test('selectors works in constructor', t => {
    let rule = new Rule({ selectors: ['a', 'b'] });
    t.deepEqual(rule.selector, 'a, b');
});

test('inserts default spaces', t => {
    let rule = new Rule({ selector: 'a' });
    t.deepEqual(rule.toString(), 'a {}');
    rule.append({ prop: 'color', value: 'black' });
    t.deepEqual(rule.toString(), 'a {\n    color: black\n}');
});

test('clones spaces from another rule', t => {
    let root = parse('b{\n  }');
    let rule = new Rule({ selector: 'em' });
    root.append(rule);
    t.deepEqual(root.toString(), 'b{\n  }\nem{\n  }');
});

test('uses different spaces for empty rules', t => {
    let root = parse('a{}\nb{\n a:1\n}');
    let rule = new Rule({ selector: 'em' });
    root.append(rule);
    t.deepEqual(root.toString(), 'a{}\nb{\n a:1\n}\nem{}');

    rule.append({ prop: 'top', value: '0' });
    t.deepEqual(root.toString(), 'a{}\nb{\n a:1\n}\nem{\n top:0\n}');
});
