import LazyResult  from './lazy-result';
import { version } from '../package';

export default class Processor {
    constructor(plugins = []) {
        this.plugins = plugins.map( i => this.normalize(i) );
    }

    // Add function as PostCSS plugins
    use(plugin) {
        plugin = this.normalize(plugin);
        if ( typeof(plugin) == 'object' && Array.isArray(plugin.plugins) ) {
            this.plugins = this.plugins.concat(plugin.plugins);
        } else {
            this.plugins.push(plugin);
        }
        return this;
    }

    // Process CSS throw installed plugins
    process(css, opts = { }) {
        return new LazyResult(this, css, opts);
    }

    // Return plugin function
    normalize(plugin) {
        var type = typeof(plugin);
        if ( (type == 'object' || type == 'function') && plugin.postcss ) {
            return plugin.postcss;
        } else {
            return plugin;
        }
    }

}

Processor.prototype.version = version;
