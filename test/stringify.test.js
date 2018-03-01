'use strict';

const stringify = require('../lib/stringify');
const parse     = require('../lib/parse');

const cases = require('postcss-parser-tests');

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
