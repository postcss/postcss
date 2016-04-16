import stringify from '../lib/stringify';
import parse     from '../lib/parse';

import cases from 'postcss-parser-tests';
import test  from 'ava';

cases.each( (name, css) => {
    if ( name === 'bom.css' ) return;

    test('stringifies ' + name, t => {
        let root   = parse(css);
        let result = '';
        stringify(root, i => {
            result += i;
        });
        t.deepEqual(result, css);
    });
});
