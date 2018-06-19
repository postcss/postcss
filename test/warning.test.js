'use strict';

const Declaration = require('../lib/declaration');
const Warning     = require('../lib/warning');
const parse       = require('../lib/parse');

const path = require('path');

it('outputs simple warning', () => {
    let warning = new Warning('text');
    expect(warning.toString()).toEqual('text');
});

it('outputs warning with plugin', () => {
    let warning = new Warning('text', { plugin: 'plugin' });
    expect(warning.toString()).toEqual('plugin: text');
});

it('outputs warning with position', () => {
    let root    = parse('a{}');
    let warning = new Warning('text', { node: root.first });
    expect(warning.toString()).toEqual('<css input>:1:1: text');
});

it('outputs warning with plugin and node', () => {
    let file    = path.resolve('a.css');
    let root    = parse('a{}', { from: file });
    let warning = new Warning('text', {
        plugin: 'plugin',
        node:   root.first
    });
    expect(warning.toString()).toEqual(`plugin: ${ file }:1:1: text`);
});

it('outputs warning with index', () => {
    let file    = path.resolve('a.css');
    let root    = parse('@rule param {}', { from: file });
    let warning = new Warning('text', {
        plugin: 'plugin',
        node:   root.first,
        index:  7
    });
    expect(warning.toString()).toEqual(`plugin: ${ file }:1:8: text`);
});

it('outputs warning with word', () => {
    let file    = path.resolve('a.css');
    let root    = parse('@rule param {}', { from: file });
    let warning = new Warning('text', {
        plugin: 'plugin',
        node:   root.first,
        word:   'am'
    });
    expect(warning.toString()).toEqual(`plugin: ${ file }:1:10: text`);
});

it('generates warning without source', () => {
    let decl    = new Declaration({ prop: 'color', value: 'black' });
    let warning = new Warning('text', { node: decl });
    expect(warning.toString()).toEqual('<css input>: text');
});

it('has line and column is undefined by default', () => {
    let warning = new Warning('text');
    expect(warning.line).not.toBeDefined();
    expect(warning.column).not.toBeDefined();
});

it('gets position from node', () => {
    let root    = parse('a{}');
    let warning = new Warning('text', { node: root.first });
    expect(warning.line).toEqual(1);
    expect(warning.column).toEqual(1);
});

it('gets position from word', () => {
    let root    = parse('a b{}');
    let warning = new Warning('text', { node: root.first, word: 'b' });
    expect(warning.line).toEqual(1);
    expect(warning.column).toEqual(3);
});

it('gets position from index', () => {
    let root    = parse('a b{}');
    let warning = new Warning('text', { node: root.first, index: 2 });
    expect(warning.line).toEqual(1);
    expect(warning.column).toEqual(3);
});
