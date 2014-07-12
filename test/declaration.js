var Declaration = require('../lib/declaration');
var parse       = require('../lib/parse');

var should = require('should');

describe('Declaration', () => {

    it('initializes with properties', () => {
        var decl = new Declaration({ prop: 'color', value: 'black' });

        decl.prop.should.eql('color');
        decl.value.should.eql('black');
    });

    describe('important', () => {

        it('returns boolean', () => {
            var decl = new Declaration({ prop: 'color', value: 'black' });
            decl.important = true;
            decl.toString().should.eql('\n    color: black !important')
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

            clone.value.should.eql('white');
            should.not.exists(clone.parent);
            should.not.exists(clone.before);
            should.not.exists(clone.between);
        });

    });

    describe('toString()', () => {

        it('inserts default spaces', () => {
            var decl = new Declaration({ prop: 'color', value: 'black' });
            decl.toString().should.eql("\n    color: black");
        });

        it('clone spaces from another declaration', () => {
            var root = parse('a{color:black}');
            var decl = new Declaration({ prop: 'margin', value: '0' });
            root.first.append(decl);

            decl.toString().should.eql('margin:0');
        });

    });

});
