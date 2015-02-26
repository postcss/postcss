import Node from './node';

export default class Comment extends Node {
    constructor(defaults) {
        this.type = 'comment';
        super(defaults);
    }

    stringify(builder) {
        var before = this.style('before');
        if ( before ) builder(before);
        var left  = this.style('left',  'commentLeft');
        var right = this.style('right', 'commentRight');
        builder('/*' + left + this.text + right + '*/', this);
    }
}
