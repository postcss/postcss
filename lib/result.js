var MapGenerator = require('./map-generator');

// Object with processed CSS
class Result {
    constructor(root, opts = { }) {
        this.root = root;
        this.opts = opts;
    }

    // Lazy method to return source map
    get map() {
        if ( !this.cssCached ) this.stringify();
        return this.mapCached;
    }

    // Lazy method to return CSS string
    get css() {
        if ( !this.cssCached ) this.stringify();
        return this.cssCached;
    }

    // Return CSS string on any try to print
    toString() {
        return this.css;
    }

    // Generate CSS and map
    stringify() {
        var map = new MapGenerator(this.root, this.opts);
        var generated  = map.generate();
        this.cssCached = generated[0];
        this.mapCached = generated[1];
    }
}

module.exports = Result;
