import MapGenerator from './map-generator';
import Result       from './result';
import parse        from './parse';
import Root         from './root';

// Lazy object to process CSS only on css/map request.
export default class LazyResult {
    constructor(processor, css, opts) {
        this.stringified = false;
        this.processed   = false;

        var root;
        if ( css instanceof Root ) {
            root = css;
        } else if ( css instanceof LazyResult || css instanceof Result ) {
            root = css.root;
            if ( css.map && typeof(opts.map) == 'undefined' ) {
                opts.map = { prev: css.map };
            }
        } else {
            root = parse(css, opts);
        }

        this.result = new Result(processor, root, opts);
    }

    // Return processor from real result
    get processor() {
        return this.result.processor;
    }

    // Return options from real result
    get opts() {
        return this.result.opts;
    }

    // Process CSS through processor plugins and return result CSS
    get css() {
        if ( !this.stringified ) this.stringify();
        return this.result.css;
    }

    // Process CSS through processor plugins and return result source map
    // if it should be saved in separted file
    get map() {
        if ( !this.stringified ) this.stringify();
        return this.result.map;
    }

    // Process CSS through processor plugins and return result CSS AST
    get root() {
        if ( !this.processed ) this.processSync();
        return this.result.root;
    }

    // Return CSS string on any try to print
    toString() {
        return this.css;
    }

    // Process CSS through processor plugins
    processSync() {
        this.processed = true;

        for ( var plugin of this.result.processor.plugins ) {
            var returnred = plugin(this.result.root, this.result);
            if ( returnred instanceof Root ) this.result.root = returnred;
        }
    }

    // Stringify CSS AST after processing
    stringify() {
        if ( !this.processed ) this.processSync();
        this.stringified = true;

        var map = new MapGenerator(this.result.root, this.result.opts);
        [this.result.css, this.result.map] = map.generate();
    }

};
