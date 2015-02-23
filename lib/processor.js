import Result from './result';
import parse  from './parse';
import Root   from './root';

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
        var parsed;
        if ( css instanceof Root ) {
            parsed = css;
        } else if ( css instanceof Result ) {
            parsed = css.root;
            if ( css.map && typeof(opts.map) == 'undefined' ) {
                opts.map = { prev: css.map };
            }
        } else {
            parsed = parse(css, opts);
        }

        for ( var plugin of this.plugins ) {
            var returned = plugin(parsed, this);
            if ( returned instanceof Root ) parsed = returned;
        }

        return parsed.toResult(opts);
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
