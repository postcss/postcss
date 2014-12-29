var Comment = require('../lib/comment');
var parse   = require('../lib/parse');

var expect = require('chai').expect;

describe('Comment', () => {

    describe('toString()', () => {

        it('inserts default spaces', () => {
            var comment = new Comment({ text: 'hi' });
            expect(comment.toString()).to.eql('/* hi */');
        });

        it('clone spaces from another comment', () => {
            var root    = parse('a{} /*hello*/');
            var comment = new Comment({ text: 'world' });
            root.append(comment);

            expect(comment.toString()).to.eql(' /*world*/');
        });

    });

});
