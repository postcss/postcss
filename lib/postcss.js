import Declaration from './declaration';
import Processor   from './processor';
import Comment     from './comment';
import AtRule      from './at-rule';
import vendor      from './vendor';
import parse       from './parse';
import list        from './list';
import Rule        from './rule';
import Root        from './root';

let postcss = function (...plugins) {
    if ( plugins.length === 1 && Array.isArray(plugins[0]) ) {
        plugins = plugins[0];
    }
    return new Processor(plugins);
};

postcss.plugin = function (name, initializer) {
    let creator = function () {
        let transformer = initializer.apply(this, arguments);
        transformer.postcssPlugin  = name;
        transformer.postcssVersion = Processor.prototype.version;
        return transformer;
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
