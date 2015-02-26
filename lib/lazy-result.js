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
        return this.stringify().css;
    }

    // Process CSS through processor plugins and return result source map
    // if it should be saved in separted file
    get map() {
        return this.stringify().map;
    }

    // Process CSS through processor plugins and return result CSS AST
    get root() {
        return this.sync().root;
    }

    // Return CSS string on any try to print
    toString() {
        return this.css;
    }

    // Promise method, that will call onFulfilled with Result instance
    // after all plugin transformations
    then(onFulfilled, onRejected) {
        return this.async().then(onFulfilled, onRejected);
    }

    // Promise method, that will execute callback on any plugin error
    catch(onRejected) {
        return this.async().catch(onRejected);
    }

    // Return Promise for plugin transformations
    async() {
        if ( this.processed ) {
            return Promise.resolve().then( () => this.stringify() );
        }
        if ( this.processing ) {
            return this.processing;
        }

        this.processing = this.processor.plugins.map( (plugin) => {
            return new Promise( (resolve, reject) => {

                var returned = plugin(this.result.root, this.result);
                if ( returned instanceof Promise ) {
                    returned
                        .then( () => resolve() )
                        .catch( (error) => reject(error) );
                } else {
                    if ( returned instanceof Root ) this.result.root = returned;
                    resolve();
                }

            });
        })
        .reduce( (sequence, promise) => {
            return sequence.then( () => promise );
        }, Promise.resolve())
        .then( () => {
            this.processed = true;
            return this.stringify();
        });

        return this.processing;
    }

    // Process CSS through processor plugins
    sync() {
        if ( this.processed ) return this.result;
        this.processed = true;

        if ( this.processing ) {
            throw 'Use process(css).then(cb) to work with async plugins';
        }

        for ( var plugin of this.result.processor.plugins ) {
            var returned = plugin(this.result.root, this.result);
            if ( returned instanceof Promise ) {
                throw 'Use process(css).then(cb) to work with async plugins';
            } else if ( returned instanceof Root ) {
                this.result.root = returned;
            }
        }

        return this.result;
    }

    // Stringify CSS AST after processing
    stringify() {
        if ( this.stringified ) return this.result;
        this.stringified = true;

        this.sync();
        var map = new MapGenerator(this.result.root, this.result.opts);
        [this.result.css, this.result.map] = map.generate();

        return this.result;
    }

}
