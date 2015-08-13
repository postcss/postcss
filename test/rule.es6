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
                selector: '[foo=\'a, b\'], a:-moz-any(:focus, [href*=\',\'])'
            });
            expect(rule.selectors).to.eql([
                '[foo=\'a, b\']',
                'a:-moz-any(:focus, [href*=\',\'])']);
        });

        it('receive array', () => {
            let rule = new Rule({ selector: 'i, b' });
            rule.selectors = ['em', 'strong'];
            expect(rule.selector).to.eql('em, strong');
        });

        it('saves separator', () => {
            let rule = new Rule({ selector: 'i,\nb' });
            rule.selectors = ['em', 'strong'];
            expect(rule.selector).to.eql('em,\nstrong');
        });

        it('uses between to detect separator', () => {
            let rule = new Rule({ selector: 'b', raws: { between: '' } });
            rule.selectors = ['b', 'strong'];
            expect(rule.selector).to.eql('b,strong');
        });

        it('uses space in separator be default', () => {
            let rule = new Rule({ selector: 'b' });
            rule.selectors = ['b', 'strong'];
            expect(rule.selector).to.eql('b, strong');
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
            let root = parse('b{\n  }');
            let rule = new Rule({ selector: 'em' });
            root.append(rule);
            expect(root.toString()).to.eql('b{\n  }\nem{\n  }');
        });

        it('uses different spaces for empty rules', () => {
            let root = parse('a{}\nb{\n a:1\n}');
            let rule = new Rule({ selector: 'em' });
            root.append(rule);
            expect(root.toString()).to.eql('a{}\nb{\n a:1\n}\nem{}');

            rule.append({ prop: 'top', value: '0' });
            expect(root.toString()).to.eql('a{}\nb{\n a:1\n}\nem{\n top:0\n}');
        });

    });

});
