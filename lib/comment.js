var Node = require('./node');

// CSS comment between declarations or rules
class Comment extends Node {
    constructor(defaults) {
        this.type = 'comment';
        super(defaults);
    }

    // Stringify declaration
    stringify(builder) {
        var before = this.style('before');
        if ( before ) builder(before);
        var left  = this.style('left',  'commentLeft');
        var right = this.style('right', 'commentRight');
        builder('/*' + left + this.text + right + '*/', this);
    }
}

module.exports = Comment;
