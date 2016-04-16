import list from '../lib/list';

import test from 'ava';

test('space() splits list by spaces', t => {
    t.deepEqual(list.space('a b'), ['a', 'b']);
});

test('space() trims values', t => {
    t.deepEqual(list.space(' a  b '), ['a', 'b']);
});

test('space() checks quotes', t => {
    t.deepEqual(list.space('"a b\\"" \'\''), ['"a b\\""', '\'\'']);
});

test('space() checks functions', t => {
    t.deepEqual(list.space('f( )) a( () )'), ['f( ))', 'a( () )']);
});

test('space() works from variable', t => {
    let space = list.space;
    t.deepEqual(space('a b'), ['a', 'b']);
});

test('comma() splits list by spaces', t => {
    t.deepEqual(list.comma('a, b'), ['a', 'b']);
});

test('comma() adds last empty', t => {
    t.deepEqual(list.comma('a, b,'), ['a', 'b', '']);
});

test('comma() checks quotes', t => {
    t.deepEqual(list.comma('"a,b\\"", \'\''), ['"a,b\\""', '\'\'']);
});

test('comma() checks functions', t => {
    t.deepEqual(list.comma('f(,)), a(,(),)'), ['f(,))', 'a(,(),)']);
});

test('comma() works from variable', t => {
    let comma = list.comma;
    t.deepEqual(comma('a, b'), ['a', 'b']);
});
