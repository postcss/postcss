import stringify from '../lib/stringify';
import parse     from '../lib/parse';

import { expect } from 'chai';
import   cases    from 'postcss-parser-tests';

describe('stringify', () => {

    cases.each( (name, css) => {
        it('stringifies ' + name, () => {
            let root   = parse(css);
            let result = '';
            stringify(root, i => result += i );
            expect(result).to.eql(css);
        });
    });

});
