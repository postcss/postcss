import Comment from '../lib/comment';
import parse   from '../lib/parse';

import { expect } from 'chai';

describe('Comment', () => {

    describe('toString()', () => {

        it('inserts default spaces', () => {
            let comment = new Comment({ text: 'hi' });
            expect(comment.toString()).to.eql('/* hi */');
        });

        it('clone spaces from another comment', () => {
            let root    = parse('a{} /*hello*/');
            let comment = new Comment({ text: 'world' });
            root.append(comment);

            expect(comment.toString()).to.eql(' /*world*/');
        });

    });

});
