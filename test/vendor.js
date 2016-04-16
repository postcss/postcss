import vendor from '../lib/vendor';

import test from 'ava';

test('returns prefix', t => {
    t.deepEqual(vendor.prefix('-moz-color'), '-moz-');
    t.deepEqual(vendor.prefix('color'     ), '');
});

test('returns unprefixed version', t => {
    t.deepEqual(vendor.unprefixed('-moz-color'), 'color');
    t.deepEqual(vendor.unprefixed('color'     ), 'color');
});
