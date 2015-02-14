import Comment from '../lib/comment';
import parse   from '../lib/parse';

import { expect } from 'chai';

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
