var Node = require('./node');

// CSS comment between declarations or rules
class Comment extends Node {
    constructor(defaults) {
        this.type = 'comment';
        super(defaults);
    }

    // Default spaces for new node
    defaultStyle() {
       return { left: ' ', right: ' ' };
    }

    // Stringify declaration
    stringify(builder) {
        var style = this.style();
        if ( this.before ) builder(this.before);
        builder('/*' + style.left + this.text + style.right + '*/', this);
    }
}

module.exports = Comment;
