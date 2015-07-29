import Warning from '../lib/warning';
import parse   from '../lib/parse';

import { expect }  from 'chai';
import { resolve } from 'path';

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
            let root     = parse('a{}', { from: resolve('/a.css') });
            let warning  = new Warning('text', {
                plugin: 'plugin',
                node:    root.first
            });
            let expected = `plugin: ${resolve('/a.css') }:1:1: text`;
            expect(warning.toString()).to.eql(expected);
        });

    });

});
