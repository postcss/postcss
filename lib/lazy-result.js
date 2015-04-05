import MapGenerator from './map-generator';
import warnOnce     from './warn-once';
import Result       from './result';
import parse        from './parse';
import Root         from './root';

let Promise = global.Promise || require('es6-promise').Promise;

function isPromise(obj) {
    return typeof obj === 'object' && typeof obj.then === 'function';
}

export default class LazyResult {
    constructor(processor, css, opts) {
        this.stringified = false;
        this.processed   = false;

        let root;
        if ( css instanceof Root ) {
            root = css;
        } else if ( css instanceof LazyResult || css instanceof Result ) {
            root = css.root;
            if ( css.map && typeof opts.map === 'undefined' ) {
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

    asyncTick(plugins, resolve, reject) {
        if ( plugins.length === 0 ) return resolve();

        let promise = this.run(plugins.shift());
        if ( isPromise(promise) ) {
            promise.then( () => {
                this.asyncTick(plugins, resolve, reject);
            }).catch( (error) => {
                reject(error);
            });
        } else {
            this.asyncTick(plugins, resolve, reject);
        }
    }

    async() {
        if ( this.processed ) {
            return Promise.resolve().then( () => this.stringify() );
        }
        if ( this.processing ) {
            return this.processing;
        }

        let plugins = this.processor.plugins.slice(0);
        this.processing = new Promise( (resolve, reject) => {
            this.asyncTick(plugins, resolve, reject);
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
            throw 'Use process(css).then(cb) to work with async plugins';
        }

        for ( let plugin of this.result.processor.plugins ) {
            let promise = this.run(plugin);
            if ( isPromise(promise) ) {
                throw 'Use process(css).then(cb) to work with async plugins';
            }
        }

        return this.result;
    }

    run(plugin) {
        this.result.lastPlugin = plugin;

        let returned;
        try {
            returned = plugin(this.result.root, this.result);
        } catch (error) {
            if ( plugin.postcssVersion ) {
                let pluginName     = plugin.postcssPlugin;
                let pluginVersion  = plugin.postcssVersion;
                let runtimeVersion = this.result.processor.version;
                let a = pluginVersion.split('.');
                let b = runtimeVersion.split('.');

                if ( a[0] !== b[0] || parseInt(a[1]) > parseInt(b[1]) ) {
                    warnOnce(`${pluginName} is based on ` +
                             `PostCSS ${pluginVersion} but you use it ` +
                             `with PostCSS ${runtimeVersion}. ` +
                             `Maybe this is a source of error below.`);
                }
            }
            throw error;
        }

        if ( returned instanceof Root ) {
            this.result.root = returned;
        } else {
            return returned;
        }
    }

    stringify() {
        if ( this.stringified ) return this.result;
        this.stringified = true;

        this.sync();
        let map = new MapGenerator(this.result.root, this.result.opts);
        [this.result.css, this.result.map] = map.generate();

        return this.result;
    }

}
