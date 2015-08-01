import list from '../lib/list';

import { expect } from 'chai';

describe('list', () => {

    describe('.space()', () => {

        it('splits list by spaces', () => {
            expect(list.space('a b')).to.eql(['a', 'b']);
        });

        it('trims values', () => {
            expect(list.space(' a  b ')).to.eql(['a', 'b']);
        });

        it('checks quotes', () => {
            expect(list.space('"a b\\"" \'\'')).to.eql(['"a b\\""', '\'\'']);
        });

        it('checks functions', () => {
            expect(list.space('f( )) a( () )')).to.eql(['f( ))', 'a( () )']);
        });

        it('works from variable', () => {
            let space = list.space;
            expect(space('a b')).to.eql(['a', 'b']);
        });

    });

    describe('.comma()', () => {

        it('splits list by spaces', () => {
            expect(list.comma('a, b')).to.eql(['a', 'b']);
        });

        it('adds last empty', () => {
            expect(list.comma('a, b,')).to.eql(['a', 'b', '']);
        });

        it('checks quotes', () => {
            expect(list.comma('"a,b\\"", \'\'')).to.eql(['"a,b\\""', '\'\'']);
        });

        it('checks functions', () => {
            expect(list.comma('f(,)), a(,(),)')).to.eql(['f(,))', 'a(,(),)']);
        });

        it('works from variable', () => {
            let comma = list.comma;
            expect(comma('a, b')).to.eql(['a', 'b']);
        });

    });

});
