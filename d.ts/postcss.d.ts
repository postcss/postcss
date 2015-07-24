import Declaration from './declaration';
import Processor from './processor';
import Comment from './comment';
import AtRule from './at-rule';
import Node from './node';
import Result from './result';
import Rule from './rule';
import Root from './root';
declare function postcss(plugins?: (postcss.Plugin | postcss.Transformer | Processor)[]): Processor;
declare module postcss {
    /**
     *
     * @param name Plugin name. Same as in name property in package.json. It will
     * be saved in plugin.postcssPlugin property.
     * @param initializer Will receive plugin options and should return functions
     * to modify nodes in input CSS.
     */
    function plugin(name: string, initializer: PluginInitializer): Plugin;
    interface Plugin {
        (): Transformer;
        postcss: Transformer;
    }
    interface Transformer {
        (root: Root, result?: Result): void | Promise<void>;
        postcssPlugin?: string;
        postcssVersion?: string;
    }
    interface PluginInitializer {
        (pluginOptions?: any): Transformer;
    }
    var vendor: {
        prefix(prop: any): any;
        unprefixed(prop: any): any;
    };
    function parse(): any;
    var list: {
        split(s: string, separators: string[], last?: boolean): any[];
        space(s: string): any;
        comma(s: string): any;
    };
    function comment(defaults?: Comment.NewProps): Comment;
    function atRule(defaults?: AtRule.NewProps): AtRule;
    function decl(defaults: Declaration.NewProps): Declaration;
    function rule(defaults?: Rule.NewProps): Rule;
    function root(defaults?: NodeDefaults): Root;
    interface NodeDefaults {
        name?: string;
        parent?: Node;
        nodes?: Node[];
    }
    interface SourceMapOptions {
        /**
         * Indicates that the source map should be embedded in the output CSS as a
         * Base64-encoded comment. By default, it is true. But if all previous maps
         * are external, not inline, PostCSS will not embed the map even if you do
         * not set this option.
         *
         * If you have an inline source map, the result.map property will be empty,
         * as the source map will be contained within the text of result.css.
         */
        inline?: boolean;
        /**
         * Source map content from a previous processing step (for example, Sass compilation).
         * PostCSS will try to read the previous source map automatically (based on comments
         * within the source CSS), but you can use this option to identify it manually.
         * If desired, you can omit the previous map with prev: false.
         */
        prev?: any;
        /**
         * Indicates that PostCSS should set the origin content (for example, Sass source)
         * of the source map. By default, it is true. But if all previous maps do not
         * contain sources content, PostCSS will also leave it out even if you do not set
         * this option.
         */
        sourcesContent?: boolean;
        /**
         * Indicates that PostCSS should add annotation comments to the CSS. By default,
         * PostCSS will always add a comment with a path to the source map. PostCSS will
         * not add annotations to CSS files that do not contain any comments.
         *
         * By default, PostCSS presumes that you want to save the source map as
         * opts.to + '.map' and will use this path in the annotation comment. A different
         * path can be set by providing a string value for annotation.
         *
         * If you have set inline: true, annotation cannot be disabled.
         */
        annotation?: boolean | string;
        /**
         * If true, PostCSS will try to correct any syntax errors that it finds in the CSS.
         * This is useful for legacy code filled with hacks. Another use-case is interactive
         * tools with live input � for example, the Autoprefixer demo.
         */
        safe?: boolean;
    }
}
export default postcss;
