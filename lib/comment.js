import Node from './node';

export default class Comment extends Node {
    constructor(defaults) {
        this.type = 'comment';
        super(defaults);
    }

    stringify(builder) {
        let before = this.style('before');
        if ( before ) builder(before);
        let left  = this.style('left',  'commentLeft');
        let right = this.style('right', 'commentRight');
        builder('/*' + left + this.text + right + '*/', this);
    }
}
