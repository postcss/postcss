import packageInfo from '../package';
import LazyResult  from './lazy-result';

export default class Processor {

    version = packageInfo.version;

    constructor(plugins = []) {
        this.plugins = this.normalize(plugins);
    }

    use(plugin) {
        this.plugins = this.plugins.concat(this.normalize([plugin]));
        return this;
    }

    process(css, opts = { }) {
        return new LazyResult(this, css, opts);
    }

    normalize(plugins) {
        let normalized = [];
        for ( let i of plugins ) {
            if ( i.postcss ) i = i.postcss;

            if ( typeof i === 'object' && Array.isArray(i.plugins) ) {
                normalized = normalized.concat(i.plugins);
            } else if ( typeof i === 'function' ) {
                normalized.push(i);
            } else {
                throw new Error(i + ' is not a PostCSS plugin');
            }
        }
        return normalized;
    }

}
