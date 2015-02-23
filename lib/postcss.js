import Declaration from './declaration';
import Processor   from './processor';
import Comment     from './comment';
import AtRule      from './at-rule';
import vendor      from './vendor';
import parse       from './parse';
import list        from './list';
import Rule        from './rule';
import Root        from './root';

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
    return new Processor(plugins);
};

// Split vendor prefix
postcss.vendor = vendor;

// Compile CSS to nodes
postcss.parse = parse;

// Parse lists by spaces or comma
postcss.list = list;

// Create PostCSS plugin
postcss.plugin = function (name, initializer) {
    var result = function () {
        return initializer.apply(this, arguments);
    };
    result.postcssPlugin = name;
    result.postcss = function (css, processor) {
        return result().apply(this, arguments);
    };
    return result;
};

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

export default postcss;
