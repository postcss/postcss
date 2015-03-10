import LazyResult from './lazy-result';

export default class Processor {
    constructor(plugins = []) {
        this.plugins = plugins.map( i => this.normalize(i) );
    }

    use(plugin) {
        plugin = this.normalize(plugin);
        if ( typeof plugin === 'object' && Array.isArray(plugin.plugins) ) {
            this.plugins = this.plugins.concat(plugin.plugins);
        } else {
            this.plugins.push(plugin);
        }
        return this;
    }

    process(css, opts = { }) {
        return new LazyResult(this, css, opts);
    }

    normalize(plugin) {
        let type = typeof plugin;
        if ( (type === 'object' || type === 'function') && plugin.postcss ) {
            return plugin.postcss;
        } else {
            return plugin;
        }
    }

}

Processor.prototype.version = require('../package').version;
