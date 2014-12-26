var Declaration = require('./declaration');
var Container   = require('./container');
var Comment     = require('./comment');
var AtRule      = require('./at-rule');
var Result      = require('./result');
var Rule        = require('./rule');

// Root of CSS
class Root extends Container {
    constructor(defaults) {
        this.type  = 'root';
        this.nodes = [];
        super(defaults);
    }

    // Fix space when we remove first child
    remove(child) {
        child = this.index(child);

        if ( child === 0 && this.nodes.length > 1 ) {
            this.nodes[1].before = this.nodes[child].before;
        }

        return super.remove(child);
    }

    // Fix spaces on insert before first rule
    normalize(child, sample, type) {
        var nodes = super.normalize(child, sample, type);

        for ( var i = 0; i < nodes.length; i++ ) {
            if ( type == 'prepend' ) {
                if ( this.nodes.length > 1 ) {
                    sample.before = this.nodes[1].before;
                } else if ( this.nodes.length == 1 ) {
                    sample.before = this.after;
                }
            } else {
                if ( this.nodes.length > 1 ) {
                    if ( sample ) nodes[i].before = sample.before;
                } else {
                    nodes[i].before = this.after;
                }
            }
        }

        return nodes;
    }

    // Stringify styles
    stringify(builder) {
        this.stringifyContent(builder);
        if ( this.after ) builder(this.after);
    }

    // Generate processing result with optional source map
    toResult(opts = { }) {
        return new Result(this, opts);
    }
}

module.exports = Root;
