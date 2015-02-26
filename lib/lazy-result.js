import MapGenerator from './map-generator';
import Result       from './result';
import parse        from './parse';
import Root         from './root';

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

    get processor() {
        return this.result.processor;
    }

    get opts() {
        return this.result.opts;
    }

    get css() {
        return this.stringify().css;
    }

    get map() {
        return this.stringify().map;
    }

    get root() {
        return this.sync().root;
    }

    toString() {
        return this.css;
    }

    then(onFulfilled, onRejected) {
        return this.async().then(onFulfilled, onRejected);
    }

    catch(onRejected) {
        return this.async().catch(onRejected);
    }

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

    stringify() {
        if ( this.stringified ) return this.result;
        this.stringified = true;

        this.sync();
        var map = new MapGenerator(this.result.root, this.result.opts);
        [this.result.css, this.result.map] = map.generate();

        return this.result;
    }

}
