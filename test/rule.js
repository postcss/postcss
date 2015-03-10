import parse from '../lib/parse';
import Rule  from '../lib/rule';

import { expect } from 'chai';

describe('Rule', () => {

    it('initializes with properties', () => {
        let rule = new Rule({ selector: 'a' });
        expect(rule.selector).to.eql('a');
    });

    describe('selectors', () => {

        it('returns array', () => {
            let rule = new Rule({ selector: 'a,b' });
            expect(rule.selectors).to.eql(['a', 'b']);
        });

        it('trims selectors', () => {
            let rule = new Rule({ selector: '.a\n, .b  , .c' });
            expect(rule.selectors).to.eql(['.a', '.b', '.c']);
        });

        it('is smart about commas', () => {
            // Note: We don’t have to care about unquoted attribute values
            // (such as `[foo=a,b]`), because that is invalid CSS.
            let rule = new Rule({
                selector: "[foo='a, b'], a:-moz-any(:focus, [href*=','])"
            });
            expect(rule.selectors).to.eql([
                "[foo='a, b']",
                "a:-moz-any(:focus, [href*=','])"]);
        });

        it('receive array', () => {
            let rule = new Rule({ selector: 'a,b' });
            rule.selectors = ['em', 'strong'];
            expect(rule.selector).to.eql('em, strong');
        });

    });

    describe('toString()', () => {

        it('inserts default spaces', () => {
            let rule = new Rule({ selector: 'a' });
            expect(rule.toString()).to.eql('a {}');
            rule.append({ prop: 'color', value: 'black' });
            expect(rule.toString()).to.eql('a {\n    color: black\n}');
        });

        it('clones spaces from another rule', () => {
            let root = parse('a{\n  }b{\n  }');
            let rule = new Rule({ selector: 'em' });
            root.append(rule);

            expect(rule.toString()).to.eql('em{\n  }');
        });

        it('uses different spaces for empty rules', () => {
            let root = parse('a { }\nb {\n  color: black\n}');
            let rule = new Rule({ selector: 'em' });
            root.append(rule);

            expect(rule.toString()).to.eql('\nem { }');

            rule.append({ prop: 'top', value: '0' });
            expect(rule.toString()).to.eql('\nem {\n  top: 0\n}');
        });

    });

});
