import Declaration from '../lib/declaration';
import parse       from '../lib/parse';
import Rule        from '../lib/rule';

import test from 'ava';

test('initializes with properties', t => {
    let decl = new Declaration({ prop: 'color', value: 'black' });
    t.deepEqual(decl.prop,  'color');
    t.deepEqual(decl.value, 'black');
});

test('returns boolean important', t => {
    let decl = new Declaration({ prop: 'color', value: 'black' });
    decl.important = true;
    t.deepEqual(decl.toString(), 'color: black !important');
});

test('inserts default spaces', t => {
    let decl = new Declaration({ prop: 'color', value: 'black' });
    let rule = new Rule({ selector: 'a' });
    rule.append(decl);
    t.deepEqual(rule.toString(), 'a {\n    color: black\n}');
});

test('clones spaces from another declaration', t => {
    let root = parse('a{color:black}');
    let decl = new Declaration({ prop: 'margin', value: '0' });
    root.first.append(decl);
    t.deepEqual(root.toString(), 'a{color:black;margin:0}');
});
