var Comment = require('../lib/comment');
var parse   = require('../lib/parse');

describe('Comment', () => {

    describe('toString()', () => {

        it('inserts default spaces', () => {
            var comment = new Comment({ text: 'hi' });
            comment.toString().should.eql('/* hi */');
        });

        it('clone spaces from another comment', () => {
            var root    = parse('/*hello*/');
            var comment = new Comment({ text: 'world' });
            root.append(comment);

            comment.toString().should.eql('/*world*/');
        });

    });

});
