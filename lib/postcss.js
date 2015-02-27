import Declaration from './declaration';
import Processor   from './processor';
import Comment     from './comment';
import AtRule      from './at-rule';
import vendor      from './vendor';
import parse       from './parse';
import list        from './list';
import Rule        from './rule';
import Root        from './root';

var warn = (message) => {
    if ( typeof(console) != 'undefined' && console.warn ) console.warn(message);
};

var postcss = function (...plugins) {
    if ( plugins.length == 1 && Array.isArray(plugins[0]) ) {
        plugins = plugins[0];
    }
    return new Processor(plugins);
};

postcss.plugin = function (name, initializer) {
    var creator = function () {
        var transformer = initializer.apply(this, arguments);

        var wrap = function (css, result) {
            try {
                return transformer.apply(this, arguments);
            } catch (e) {
                var pluginVersion  = wrap.postcssVersion;
                var runtimeVersion = result.processor.version;
                var a = pluginVersion.split('.');
                var b = runtimeVersion.split('.');

                if ( a[0] != b[0] || parseInt(a[1]) > parseInt(b[1]) ) {
                    warn(`${name} is based on PostCSS ${pluginVersion} ` +
                         `but you use it with PostCSS ${runtimeVersion}. ` +
                         'Maybe this is a source of error below.');
                }
                throw e;
            }
        };

        wrap.postcssPlugin  = name;
        wrap.postcssVersion = Processor.prototype.version;
        return wrap;
    };

    creator.postcss = creator();
    return creator;
};

postcss.vendor = vendor;

postcss.parse = parse;

postcss.list = list;

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
