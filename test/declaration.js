var Declaration = require('../lib/declaration');
var parse       = require('../lib/parse');
var Rule        = require('../lib/rule');

var expect = require('chai').expect;

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

    describe('clone()', () => {

        it('cleans parent, between and before', () => {
            var decl = new Declaration({
                prop:    'color',
                value:   'black',
                before:  "\n    ",
                between: ' ',
                parent:  { }
            });
            var clone = decl.clone({ value: 'white' });

            expect(clone.value).to.eql('white');
            expect(clone.parent).to.not.exist();
            expect(clone.before).to.not.exist();
            expect(clone.between).to.not.exist();
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
