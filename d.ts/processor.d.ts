import LazyResult from './lazy-result';
import postcss from './postcss';
import Result from './result';
declare class Processor {
    static version: any;
    /**
     * Contains plugins added to this processor.
     */
    plugins: postcss.Plugin[];
    /**
     * A Processor instance contains plugins to process CSS. Create one Processor
     * instance, initialize its plugins, and then use that instance on many CSS files.
     */
    constructor(plugins?: (postcss.Plugin | postcss.Transformer | Processor)[]);
    /**
     * Adds a plugin to be used as a CSS processor. Plugins can also be added by
     */
    use(plugin: postcss.Plugin | postcss.Transformer | Processor): Processor;
    /**
     * Parses source CSS and returns LazyResult instance. Because some plugins can
     * be asynchronous it doesn't make any transformations. Transformations will be
     * applied in LazyResult's methods.
     * @param css
     * @param options
     * @returns {}
     */
    process(
        /**
         * String with input CSS or any object with toString() method, like file stream.
         * Optionally, send Result instance and the processor will take the existing
         * [Root] parser from it.
         */
        css: string | {
        toString(): string;
    } | Result, options?: Processor.ProcessOptions): LazyResult;
    private normalize(plugins);
}
declare module Processor {
    interface ProcessOptions {
        /**
         * The path of the CSS source file. You should always set from, because it is
         * used in source map generation and syntax error messages.
         */
        from?: string;
        /**
         * The path where you'll put the output CSS file. You should always set it
         * to generate correct source maps.
         */
        to?: string;
        /**
         * Enable Safe Mode, in which PostCSS will try to fix CSS syntax errors.
         */
        safe?: boolean;
        map?: postcss.SourceMapOptions;
    }
}
export default Processor;
