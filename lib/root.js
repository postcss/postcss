var Declaration = require('./declaration');
var Container   = require('./container');
var Comment     = require('./comment');
var AtRule      = require('./at-rule');
var Result      = require('./result');
var Rule        = require('./rule');

// Root of CSS
class Root extends Container {
    constructor(defaults) {
        this.type   = 'root';
        this.childs = [];
        super(defaults);
    }

    // Fix space when we remove first child
    remove(child) {
        child = this.index(child);

        if ( child == 0 && this.childs.length > 1 ) {
            this.childs[1].before = this.childs[child].before;
        }

        return super.remove(child);
    }

    // Fix spaces on insert before first rule
    normalize(child, sample, type) {
        var childs = super.normalize(child, sample, type);

        for ( var i = 0; i < childs.length; i++ ) {
            if ( type == 'prepend' ) {
                if ( this.childs.length > 1 ) {
                    sample.before = this.childs[1].before;
                } else if ( this.childs.length == 1 ) {
                    sample.before = this.after;
                }
            } else {
                if ( this.childs.length > 1 ) {
                    childs[i].before = sample.before;
                } else {
                    childs[i].before = this.after;
                }
            }
        }

        return childs;
    }

    // Stringify styles
    stringify(builder) {
        this.stringifyContent(builder);
        if ( this.after) builder(this.after);
    }

    // Generate processing result with optional source map
    toResult(opts = { }) {
        return new Result(this, opts);
    }
}

module.exports = Root;
