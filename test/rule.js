var parse = require('../lib/parse');
var Rule  = require('../lib/rule');

describe('Rule', () => {

    it('initializes with properties', () => {
        var rule = new Rule({ selector: 'a' });
        rule.selector.should.eql('a');
    });

    describe('selectors', () => {

        it('returns array', () => {
            var rule = new Rule({ selector: 'a,b' });
            rule.selectors.should.eql(['a', 'b']);
        });

        it('trims selectors', () => {
            var rule = new Rule({ selector: ".a\n, .b  , .c" });
            rule.selectors.should.eql(['.a', '.b', '.c']);
        });

        it('is smart about commas', () => {
            // Note: We don’t have to care about unquoted attribute values
            // (such as `[foo=a,b]`), because that is invalid CSS.
            var rule = new Rule({
                selector: "[foo='a, b'], a:-moz-any(:focus, [href*=','])"
            });
            rule.selectors.should.eql([
                "[foo='a, b']",
                "a:-moz-any(:focus, [href*=','])"]);
        });

        it('receive array', () => {
            var rule = new Rule({ selector: 'a,b' });
            rule.selectors = ['em', 'strong'];
            rule.selector.should.eql('em, strong');
        });

    });

    describe('toString()', () => {

        it('inserts default spaces', () => {
            var rule = new Rule({ selector: 'a' });
            rule.toString().should.eql('a {}');
        });

        it('clone spaces from another rule', () => {
            var root = parse("a{\n  }");
            var rule = new Rule({ selector: 'b' });
            root.append(rule);

            rule.toString().should.eql("b{\n  }");
        });

        it('use different spaces for empty rules', () => {
            var root = parse("a { }\nb {\n  color: black\n  }");
            var rule = new Rule({ selector: 'em' });
            root.append(rule);

            rule.toString().should.eql("\nem { }");

            rule.append({ prop: 'top', value: '0' });
            rule.toString().should.eql("\nem {\n  top: 0\n  }");
        });

        it('calculates after depends on childs', () => {
            var rule = new Rule({ selector: 'a' });
            rule.toString().should.eql('a {}');

            rule.append({ prop: 'color', value: 'black', before: ' ' });
            rule.toString().should.eql('a { color: black }');

            rule.first.before = "\n  ";
            rule.toString().should.eql("a {\n  color: black\n}");
        });

    });

});
