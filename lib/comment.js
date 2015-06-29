import warnOnce from './warn-once';
import Node     from './node';

export default class Comment extends Node {

    constructor(defaults) {
        super(defaults);
        this.type = 'comment';
    }

    get left() {
        warnOnce('Comment#left was deprecated. Use Comment#raw.left');
        return this.raw.left;
    }

    set left(val) {
        warnOnce('Comment#left was deprecated. Use Comment#raw.left');
        return this.raw.left = val;
    }

    get right() {
        warnOnce('Comment#right was deprecated. Use Comment#raw.right');
        return this.raw.right;
    }

    set right(val) {
        warnOnce('Comment#right was deprecated. Use Comment#raw.right');
        return this.raw.right = val;
    }

}
