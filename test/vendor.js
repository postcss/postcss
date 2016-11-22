import vendor from '../lib/vendor';

import test from 'ava';

const VALUE = '-1px -1px 1px rgba(0, 0, 0, 0.2) inset';

test('returns prefix', t => {
    t.deepEqual(vendor.prefix('-moz-color'), '-moz-');
    t.deepEqual(vendor.prefix('color'     ), '');
    t.deepEqual(vendor.prefix(VALUE), '');
});

test('returns unprefixed version', t => {
    t.deepEqual(vendor.unprefixed('-moz-color'), 'color');
    t.deepEqual(vendor.unprefixed('color'     ), 'color');
    t.deepEqual(vendor.unprefixed(VALUE), VALUE);
});
