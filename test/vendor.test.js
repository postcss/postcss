'use strict';

const vendor = require('../lib/vendor');

const VALUE = '-1px -1px 1px rgba(0, 0, 0, 0.2) inset';

it('returns prefix', () => {
    expect(vendor.prefix('-moz-color')).toEqual('-moz-');
    expect(vendor.prefix('color'     )).toEqual('');
    expect(vendor.prefix(VALUE)).toEqual('');
});

it('returns unprefixed version', () => {
    expect(vendor.unprefixed('-moz-color')).toEqual('color');
    expect(vendor.unprefixed('color'     )).toEqual('color');
    expect(vendor.unprefixed(VALUE)).toEqual(VALUE);
});
