import Declaration from '../lib/declaration';
import parse from '../lib/parse';
import Rule from '../lib/rule';

import { expect } from 'chai';

describe('Declaration', () => {

    it('initializes with properties', () => {
        var decl = new Declaration({ prop: 'color', value: 'black' });

        expect(decl.prop).to.eql('color');
        expect(decl.value).to.eql('black');
    });

    describe('important', () => {

        it('returns boolean', () => {
            var decl = new Declaration({ prop: 'color', value: 'black' });
            decl.important = true;
            expect(decl.toString()).to.eql('color: black !important');
        });

    });

    describe('toString()', () => {

        it('inserts default spaces', () => {
            var decl = new Declaration({ prop: 'color', value: 'black' });
            var rule = new Rule({ selector: 'a' });
            rule.append(decl);
            expect(decl.toString()).to.eql("\n    color: black");
        });

        it('clone spaces from another declaration', () => {
            var root = parse('a{color:black}');
            var decl = new Declaration({ prop: 'margin', value: '0' });
            root.first.append(decl);

            expect(decl.toString()).to.eql('margin:0');
        });

    });

});
