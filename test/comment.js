import Comment from '../lib/comment';
import parse   from '../lib/parse';

import test from 'ava';

test('toString() inserts default spaces', t => {
    let comment = new Comment({ text: 'hi' });
    t.deepEqual(comment.toString(), '/* hi */');
});

test('toString() clones spaces from another comment', t => {
    let root    = parse('a{} /*hello*/');
    let comment = new Comment({ text: 'world' });
    root.append(comment);

    t.deepEqual(root.toString(), 'a{} /*hello*/ /*world*/');
});
