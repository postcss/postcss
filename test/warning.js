import Warning from '../lib/warning';
import parse   from '../lib/parse';

import { expect } from 'chai';

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

        it('outputs warning with plugin and node', () => {
            let root    = parse('a{}', { from: '/a.css' });
            let warning = new Warning('text', {
                plugin: 'plugin',
                node:    root.first
            });
            expect(warning.toString()).to.eql('plugin:/a.css:1:1: text');
        });

    });

});
