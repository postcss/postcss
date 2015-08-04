import AtRule from '../lib/at-rule';
import parse  from '../lib/parse';

import { expect } from 'chai';

describe('AtRule', () => {

    it('initializes with properties', () => {
        let rule = new AtRule({ name: 'encoding', params: '"utf-8"' });

        expect(rule.name).to.eql('encoding');
        expect(rule.params).to.eql('"utf-8"');

        expect(rule.toString()).to.eql('@encoding "utf-8"');
    });

    describe('toString()', () => {

        it('inserts default spaces', () => {
            let rule = new AtRule({ name: 'page', params: 1, nodes: [] });
            expect(rule.toString()).to.eql('@page 1 {}');
        });

        it('clone spaces from another at-rule', () => {
            let root = parse('@page{}a{}');
            let rule = new AtRule({ name: 'page', params: 1, nodes: [] });
            root.append(rule);

            expect(rule.toString()).to.eql('@page 1{}');
        });

    });

});
