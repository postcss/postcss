var vendor = require('../lib/vendor');

var expect = require('chai').expect;

describe('vendor', () => {

    describe('.prefix()', () => {

        it('returns prefix',() => {
            expect(vendor.prefix('-moz-color')).to.eql('-moz-');
            expect(vendor.prefix('color'     )).to.eql('');
        });

    });

    describe('.unprefixed()', () => {

        it('returns unprefixed version', () => {
            expect(vendor.unprefixed('-moz-color')).to.eql('color');
            expect(vendor.unprefixed('color'     )).to.eql('color');
        });

    });

});
