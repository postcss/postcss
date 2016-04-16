import AtRule from '../lib/at-rule';
import parse  from '../lib/parse';

import test from 'ava';

test('initializes with properties', t => {
    let rule = new AtRule({ name: 'encoding', params: '"utf-8"' });

    t.deepEqual(rule.name, 'encoding');
    t.deepEqual(rule.params, '"utf-8"');

    t.deepEqual(rule.toString(), '@encoding "utf-8"');
});

test('does not fall on childless at-rule', t => {
    let rule = new AtRule();
    t.deepEqual(typeof rule.each( i => i ), 'undefined');
});

test('creates nodes property on prepend()', t => {
    let rule = new AtRule();
    t.deepEqual(typeof rule.nodes, 'undefined');

    rule.prepend('color: black');
    t.deepEqual(rule.nodes.length, 1);
});

test('creates nodes property on append()', t => {
    let rule = new AtRule();
    t.deepEqual(typeof rule.nodes, 'undefined');

    rule.append('color: black');
    t.deepEqual(rule.nodes.length, 1);
});

test('inserts default spaces', t => {
    let rule = new AtRule({ name: 'page', params: 1, nodes: [] });
    t.deepEqual(rule.toString(), '@page 1 {}');
});

test('clone spaces from another at-rule', t => {
    let root = parse('@page{}a{}');
    let rule = new AtRule({ name: 'page', params: 1, nodes: [] });
    root.append(rule);

    t.deepEqual(rule.toString(), '@page 1{}');
});
