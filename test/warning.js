import Declaration from '../lib/declaration';
import Warning     from '../lib/warning';
import parse       from '../lib/parse';

import path from 'path';
import test from 'ava';

test('outputs simple warning', t => {
    let warning = new Warning('text');
    t.deepEqual(warning.toString(), 'text');
});

test('outputs warning with plugin', t => {
    let warning = new Warning('text', { plugin: 'plugin' });
    t.deepEqual(warning.toString(), 'plugin: text');
});

test('outputs warning with position', t => {
    let root    = parse('a{}');
    let warning = new Warning('text', { node: root.first });
    t.deepEqual(warning.toString(), '<css input>:1:1: text');
});

test('outputs warning with plugin and node', t => {
    let file    = path.resolve('a.css');
    let root    = parse('a{}', { from: file });
    let warning = new Warning('text', {
        plugin: 'plugin',
        node:   root.first
    });
    t.deepEqual(warning.toString(), `plugin: ${ file }:1:1: text`);
});

test('outputs warning with index', t => {
    let file    = path.resolve('a.css');
    let root    = parse('@rule param {}', { from: file });
    let warning = new Warning('text', {
        plugin: 'plugin',
        node:   root.first,
        index:  7
    });
    t.deepEqual(warning.toString(), `plugin: ${ file }:1:8: text`);
});

test('outputs warning with word', t => {
    let file    = path.resolve('a.css');
    let root    = parse('@rule param {}', { from: file });
    let warning = new Warning('text', {
        plugin: 'plugin',
        node:   root.first,
        word:   'am'
    });
    t.deepEqual(warning.toString(), `plugin: ${ file }:1:10: text`);
});

test('generates warning without source', t => {
    let decl    = new Declaration({ prop: 'color', value: 'black' });
    let warning = new Warning('text', { node: decl });
    t.deepEqual(warning.toString(), '<css input>: text');
});

test('has line and column is undefined by default', t => {
    let warning = new Warning('text');
    t.deepEqual(typeof warning.line,   'undefined');
    t.deepEqual(typeof warning.column, 'undefined');
});

test('gets position from node', t => {
    let root    = parse('a{}');
    let warning = new Warning('text', { node: root.first });
    t.deepEqual(warning.line, 1);
    t.deepEqual(warning.column, 1);
});

test('gets position from word', t => {
    let root    = parse('a b{}');
    let warning = new Warning('text', { node: root.first, word: 'b' });
    t.deepEqual(warning.line, 1);
    t.deepEqual(warning.column, 3);
});

test('gets position from index', t => {
    let root    = parse('a b{}');
    let warning = new Warning('text', { node: root.first, index: 2 });
    t.deepEqual(warning.line, 1);
    t.deepEqual(warning.column, 3);
});
