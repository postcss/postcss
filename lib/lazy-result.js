import MapGenerator from './map-generator';
import stringify    from './stringify';
import warnOnce     from './warn-once';
import Result       from './result';
import parse        from './parse';

function isPromise(obj) {
    return typeof obj === 'object' && typeof obj.then === 'function';
}

export default class LazyResult {

    constructor(processor, css, opts) {
        this.stringified = false;
        this.processed   = false;

        let root;
        if ( typeof css === 'object' && css.type === 'root' ) {
            root = css;
        } else if ( css instanceof LazyResult || css instanceof Result ) {
            root = css.root;
            if ( css.map && typeof opts.map === 'undefined' ) {
                opts.map = { prev: css.map };
            }
        } else {
            let parser = parse;
            if ( opts.syntax )  parser = opts.syntax.parse;
            if ( opts.parser )  parser = opts.parser;
            if ( parser.parse ) parser = parser.parse;

            try {
                root = parser(css, opts);
            } catch (error) {
                this.error = error;
            }
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

    get content() {
        return this.stringify().content;
    }

    get map() {
        return this.stringify().map;
    }

    get root() {
        return this.sync().root;
    }

    get messages() {
        return this.sync().messages;
    }

    warnings() {
        return this.sync().warnings();
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

    handleError(error, plugin) {
        try {
            this.error = error;
            if ( error.name === 'CssSyntaxError' && !error.plugin ) {
                error.plugin = plugin.postcssPlugin;
                error.setMessage();
            } else if ( plugin.postcssVersion ) {
                let pluginName = plugin.postcssPlugin;
                let pluginVer  = plugin.postcssVersion;
                let runtimeVer = this.result.processor.version;
                let a = pluginVer.split('.');
                let b = runtimeVer.split('.');

                if ( a[0] !== b[0] || parseInt(a[1]) > parseInt(b[1]) ) {
                    warnOnce(`Your current PostCSS version is ${runtimeVer}, ` +
                             `but ${pluginName} uses ${pluginVer}. Perhaps ` +
                             `this is the source of the error below.`);
                }
            }
        } catch (err) {
            if ( console && console.error ) console.error(err);
        }
    }

    asyncTick(resolve, reject) {
        if ( this.plugin >= this.processor.plugins.length ) {
            this.processed = true;
            return resolve();
        }

        try {
            let plugin  = this.processor.plugins[this.plugin];
            let promise = this.run(plugin);
            this.plugin += 1;

            if ( isPromise(promise) ) {
                promise.then( () => {
                    this.asyncTick(resolve, reject);
                }).catch( (error) => {
                    this.handleError(error, plugin);
                    this.processed = true;
                    reject(error);
                });
            } else {
                this.asyncTick(resolve, reject);
            }

        } catch (error) {
            this.processed = true;
            reject(error);
        }
    }

    async() {
        if ( this.processed ) {
            return new Promise( (resolve, reject) => {
                if ( this.error ) {
                    reject(this.error);
                } else {
                    resolve(this.stringify());
                }
            });
        }
        if ( this.processing ) {
            return this.processing;
        }

        this.processing = new Promise( (resolve, reject) => {
            if ( this.error ) return reject(this.error);
            this.plugin = 0;
            this.asyncTick(resolve, reject);
        }).then( () => {
            this.processed = true;
            return this.stringify();
        });

        return this.processing;
    }

    sync() {
        if ( this.processed ) return this.result;
        this.processed = true;

        if ( this.processing ) {
            throw new Error(
                'Use process(css).then(cb) to work with async plugins');
        }

        if ( this.error ) throw this.error;

        for ( let plugin of this.result.processor.plugins ) {
            let promise = this.run(plugin);
            if ( isPromise(promise) ) {
                throw new Error(
                    'Use process(css).then(cb) to work with async plugins');
            }
        }

        return this.result;
    }

    run(plugin) {
        this.result.lastPlugin = plugin;

        try {
            return plugin(this.result.root, this.result);
        } catch (error) {
            this.handleError(error, plugin);
            throw error;
        }
    }

    stringify() {
        if ( this.stringified ) return this.result;
        this.stringified = true;

        this.sync();

        let opts = this.result.opts;
        let str  = stringify;
        if ( opts.syntax )      str = opts.syntax.stringify;
        if ( opts.stringifier ) str = opts.stringifier;
        if ( str.stringify )    str = str.stringify;

        let map  = new MapGenerator(str, this.result.root, this.result.opts);
        let data = map.generate();
        this.result.css = data[0];
        this.result.map = data[1];

        return this.result;
    }

}
