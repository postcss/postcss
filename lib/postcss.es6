import Declaration from './declaration';
import Processor   from './processor';
import stringify   from './stringify';
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
    let creator = function (...args) {
        let transformer = initializer(...args);
        transformer.postcssPlugin  = name;
        transformer.postcssVersion = (new Processor()).version;
        return transformer;
    };

    creator.postcss = creator();
    creator.process = function (css, opts) {
        return postcss([ creator(opts) ]).process(css, opts);
    };
    return creator;
};


postcss.stringify = stringify;
postcss.vendor    = vendor;
postcss.parse     = parse;
postcss.list      = list;

postcss.comment = (defaults) => new Comment(defaults);
postcss.atRule  = (defaults) => new AtRule(defaults);
postcss.decl    = (defaults) => new Declaration(defaults);
postcss.rule    = (defaults) => new Rule(defaults);
postcss.root    = (defaults) => new Root(defaults);

export default postcss;
