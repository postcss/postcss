import Declaration from '../lib/declaration';
import Warning     from '../lib/warning';
import parse       from '../lib/parse';

import { expect } from 'chai';
import   path     from 'path';

describe('Warning', () => {

    describe('toString()', () => {

        it('outputs simple warning', () => {
            let warning = new Warning('text');
            expect(warning.toString()).to.eql('text');
        });

        it('outputs warning with plugin', () => {
            let warning = new Warning('text', { plugin: 'plugin' });
            expect(warning.toString()).to.eql('plugin: text');
        });

        it('outputs warning with position', () => {
            let root    = parse('a{}');
            let warning = new Warning('text', { node: root.first });
            expect(warning.toString()).to.eql('<css input>:1:1: text');
        });

        it('outputs warning with plugin and node', () => {
            let file    = path.resolve('a.css');
            let root    = parse('a{}', { from: file });
            let warning = new Warning('text', {
                plugin: 'plugin',
                node:   root.first
            });
            expect(warning.toString()).to.eql(`plugin: ${ file }:1:1: text`);
        });

        it('outputs warning with index', () => {
            let file    = path.resolve('a.css');
            let root    = parse('@rule param {}', { from: file });
            let warning = new Warning('text', {
                plugin: 'plugin',
                node:   root.first,
                index:  7
            });
            expect(warning.toString()).to.eql(`plugin: ${ file }:1:8: text`);
        });

        it('outputs warning with word', () => {
            let file    = path.resolve('a.css');
            let root    = parse('@rule param {}', { from: file });
            let warning = new Warning('text', {
                plugin: 'plugin',
                node:   root.first,
                word:   'am'
            });
            expect(warning.toString()).to.eql(`plugin: ${ file }:1:10: text`);
        });

        it('generates warning without source', () => {
            let decl    = new Declaration({ prop: 'color', value: 'black' });
            let warning = new Warning('text', { node: decl });
            expect(warning.toString()).to.eql('<css input>: text');
        });

    });

    describe('line, column', () => {

        it('is undefined by default', () => {
            let warning = new Warning('text');
            expect(warning.line).to.not.exist;
            expect(warning.column).to.not.exist;
        });

        it('gets position from node', () => {
            let root    = parse('a{}');
            let warning = new Warning('text', { node: root.first });
            expect(warning.line).to.eql(1);
            expect(warning.column).to.eql(1);
        });

        it('gets position from word', () => {
            let root    = parse('a b{}');
            let warning = new Warning('text', { node: root.first, word: 'b' });
            expect(warning.line).to.eql(1);
            expect(warning.column).to.eql(3);
        });

        it('gets position from index', () => {
            let root    = parse('a b{}');
            let warning = new Warning('text', { node: root.first, index: 2 });
            expect(warning.line).to.eql(1);
            expect(warning.column).to.eql(3);
        });

    });

});
