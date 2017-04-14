import Comment from '../lib/comment';
import parse   from '../lib/parse';

it('toString() inserts default spaces', () => {
    let comment = new Comment({ text: 'hi' });
    expect(comment.toString()).toEqual('/* hi */');
});

it('toString() clones spaces from another comment', () => {
    let root    = parse('a{} /*hello*/');
    let comment = new Comment({ text: 'world' });
    root.append(comment);

    expect(root.toString()).toEqual('a{} /*hello*/ /*world*/');
});
