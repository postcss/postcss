import stringify from '../lib/stringify';
import parse     from '../lib/parse';

import cases from 'postcss-parser-tests';

cases.each( (name, css) => {
    if ( name === 'bom.css' ) return;

    it('stringifies ' + name, () => {
        let root   = parse(css);
        let result = '';
        stringify(root, i => {
            result += i;
        });
        expect(result).toEqual(css);
    });
});
