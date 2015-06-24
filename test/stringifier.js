import stringifier from '../lib/stringifier';
import Node        from '../lib/node';
import parse       from '../lib/parse';

import { expect } from 'chai';
import   path     from 'path';
import   fs       from 'fs';

describe('stringifier', () => {

    describe('.stringify()', () => {

        fs.readdirSync(path.join(__dirname, 'cases')).forEach( name => {
            if ( !name.match(/\.css$/) ) return;

            it('stringify ' + name, () => {
                let file = path.join(__dirname, 'cases', name);
                let css  = fs.readFileSync(file).toString();
                let root = parse(css, { from: file });
                expect(root.toString()).to.eql(css);
            });
        });

    });

    describe('.raw()', () => {

        it('creates trimmed/raw property', () => {
            let b = new Node({
                one: 'trim',
                _one: { value: 'trim', raw: 'raw' }
            });
            expect(stringifier.raw(b, 'one')).to.eql('raw');

            b.one = 'trim1';
            expect(stringifier.raw(b, 'one')).to.eql('trim1');
        });

        it('works without magic', () => {
            let b = new Node();
            b.one = '1';
            expect(b.one).to.eql('1');
            expect(stringifier.raw(b, 'one')).to.eql('1');
        });
    });

});
