import vendor from '../lib/vendor';

import test from 'ava';

const value = '-1px -1px 1px rgba(0, 0, 0, 0.2) inset';

test('returns prefix', t => {
    t.deepEqual(vendor.prefix(value), '');
    t.deepEqual(vendor.prefix('-moz-color'), '-moz-');
    t.deepEqual(vendor.prefix('color'     ), '');
});

test('returns unprefixed version', t => {
    t.deepEqual(vendor.unprefixed(value), value);
    t.deepEqual(vendor.unprefixed('-moz-color'), 'color');
    t.deepEqual(vendor.unprefixed('color'     ), 'color');
});
