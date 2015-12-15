import warnOnce from './warn-once';
import Node     from './node';

export default class Comment extends Node {

    type = 'comment';

    constructor(defaults) {
        super(defaults);
    }

    /* istanbul ignore next */
    get left() {
        warnOnce('Comment#left was deprecated. Use Comment#raws.left');
        return this.raws.left;
    }

    /* istanbul ignore next */
    set left(val) {
        warnOnce('Comment#left was deprecated. Use Comment#raws.left');
        this.raws.left = val;
    }

    /* istanbul ignore next */
    get right() {
        warnOnce('Comment#right was deprecated. Use Comment#raws.right');
        return this.raws.right;
    }

    /* istanbul ignore next */
    set right(val) {
        warnOnce('Comment#right was deprecated. Use Comment#raws.right');
        this.raws.right = val;
    }

}
