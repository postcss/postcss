import stringify from '../lib/stringify';
import parse     from '../lib/parse';

import { expect } from 'chai';
import   path     from 'path';
import   fs       from 'fs';

describe('stringify', () => {

    fs.readdirSync(path.join(__dirname, 'cases')).forEach( name => {
        if ( !name.match(/\.css$/) ) return;

        it('stringifies ' + name, () => {
            let file = path.join(__dirname, 'cases', name);
            let css  = fs.readFileSync(file).toString();
            let root = parse(css, { from: file });

            let result = '';
            stringify(root, i => result += i );

            expect(result).to.eql(css);
        });
    });

});
