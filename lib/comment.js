var Node = require('./node');

// CSS comment between declarations or rules
class Comment extends Node {
    constructor(defaults) {
        this.type = 'comment';
        super(defaults);
    }

    styleMap() {
        return {
            commentLeft:  this.left,
            commentRight: this.right
        };
    }

    // Stringify declaration
    stringify(builder) {
        if ( this.before ) builder(this.before);
        var left  = this.style('commentLeft');
        var right = this.style('commentRight');
        builder('/*' + left + this.text + right + '*/', this);
    }
}

module.exports = Comment;
