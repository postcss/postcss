import stringify from '../lib/stringify';
import parse     from '../lib/parse';

import { expect } from 'chai';
import   cases    from 'postcss-parser-tests';
import   path     from 'path';
import   fs       from 'fs';

describe('stringify', () => {

    cases.each( (name, css, json) => {
        it('stringifies ' + name, () => {
            let root = parse(css, { from: name });
            let result = '';
            stringify(root, i => result += i );
            expect(result).to.eql(css);
        });
    });

});
