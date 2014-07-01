var list = require('../lib/list');

describe('list', () => {

    describe('.space()', () => {

        it('splits list by spaces', () => {
            list.space('a b').should.eql(['a', 'b']);
        });

        it('trims values', () => {
            list.space(' a  b ').should.eql(['a', 'b']);
        });

        it('checks quotes', () => {
            list.space('"a b\\"" \'\'').should.eql(['"a b\\""', "''"]);
        });

        it('checks functions', () => {
            list.space('func( )) a( () )').should.eql(['func( ))', 'a( () )']);
        });

    });

    describe('.comma()', () => {

        it('splits list by spaces', () => {
            list.comma('a, b').should.eql(['a', 'b']);
        });

        it('adds last empty', () => {
            list.comma('a, b,').should.eql(['a', 'b', '']);
        });

        it('checks quotes', () => {
            list.comma('"a,b\\"", \'\'').should.eql(['"a,b\\""', "''"]);
        });

        it('checks functions', () => {
            list.comma('func(,)), a(,(),)').should.eql(['func(,))', 'a(,(),)']);
        });

    });

});
