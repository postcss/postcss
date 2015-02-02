import Declaration from './declaration';
import Comment from './comment';
import AtRule from './at-rule';
import Result from './result';
import parse from './parse';
import Rule from './rule';
import Root from './root';

// List of functions to process CSS
class PostCSS {
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
            parsed = postcss.parse(css, opts);
        }

        for ( var plugin of this.plugins ) {
            var returned = plugin(parsed, opts);
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

// Framework for CSS postprocessors
//
//   var processor = postcss(function (css) {
//       // Change nodes in css
//   });
//   processor.process(css)
var postcss = function (...plugins) {
    if ( plugins.length == 1 && Array.isArray(plugins[0]) ) {
        plugins = plugins[0];
    }
    return new PostCSS(plugins);
};

// Compile CSS to nodes
postcss.parse = parse;

// Nodes shortcuts
postcss.comment = function (defaults) {
    return new Comment(defaults);
};
postcss.atRule = function (defaults) {
    return new AtRule(defaults);
};
postcss.decl = function (defaults) {
    return new Declaration(defaults);
};
postcss.rule = function (defaults) {
    return new Rule(defaults);
};
postcss.root = function (defaults) {
    return new Root(defaults);
};

module.exports = postcss;
