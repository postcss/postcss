var vendor = require('../lib/vendor');

describe('vendor', () => {

    describe('.prefix()', () => {

        it('returns prefix',() => {
            vendor.prefix('-moz-color').should.eql('-moz-');
            vendor.prefix('color'     ).should.eql('');
        });

    });

    describe('.unprefixed()', () => {

        it('returns unprefixed version', () => {
          vendor.unprefixed('-moz-color').should.eql('color');
          vendor.unprefixed('color'     ).should.eql('color');
        });

    });

});
