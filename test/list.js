var list = require('../lib/list');

var expect = require('chai').expect;

describe('list', () => {

    describe('.space()', () => {

        it('splits list by spaces', () => {
            expect(list.space('a b')).to.eql(['a', 'b']);
        });

        it('trims values', () => {
            expect(list.space(' a  b ')).to.eql(['a', 'b']);
        });

        it('checks quotes', () => {
            expect(list.space('"a b\\"" \'\'')).to.eql(['"a b\\""', "''"]);
        });

        it('checks functions', () => {
            expect(list.space('f( )) a( () )')).to.eql(['f( ))', 'a( () )']);
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
            expect(list.comma('"a,b\\"", \'\'')).to.eql(['"a,b\\""', "''"]);
        });

        it('checks functions', () => {
            expect(list.comma('f(,)), a(,(),)')).to.eql(['f(,))', 'a(,(),)']);
        });

    });

});
