import postcss from './postcss';
import Processor from './processor';
import Root from './root';
declare class Result {
    /**
     * The Processor instance used for this transformation.
     */
    processor: Processor;
    /**
     * Contains Root node after all transformations.
     */
    root: Root;
    /**
     * Options from the Processor#process(css, opts) or Root#toResult(opts) call
     * that produced this Result instance.
     */
    opts: Result.Options;
    /**
     * A CSS string representing this Result's Root instance.
     */
    css: string;
    /**
     * An instance of the SourceMapGenerator class from the source-map library,
     * representing changes to the Result�s Root instance.
     */
    map: {
        /**
         * Add a single mapping from original source line and column to the generated
         * source's line and column for this source map being created. The mapping
         * object should have the following properties:
         * @param mapping
         * @returns {}
         */
        addMapping(mapping: {
            generated: {
                line: number;
                column: number;
            };
            original: {
                line: number;
                column: number;
            };
            /**
             * The original source file (relative to the sourceRoot).
             */
            source: string;
            name?: string;
        }): void;
        /**
         * Set the source content for an original source file.
         * @param sourceFile The URL of the original source file.
         * @param sourceContent The content of the source file.
         */
        setSourceContent(sourceFile: string, sourceContent: string): void;
        /**
         * Applies a SourceMap for a source file to the SourceMap. Each mapping to
         * the supplied source file is rewritten using the supplied SourceMap.
         * Note: The resolution for the resulting mappings is the minimium of this
         * map and the supplied map.
         * @param sourceMapConsumer The SourceMap to be applied.
         * @param sourceFile The filename of the source file. If omitted, sourceMapConsumer
         * file will be used, if it exists. Otherwise an error will be thrown.
         * @param sourceMapPath The dirname of the path to the SourceMap to be applied.
         * If relative, it is relative to the SourceMap. This parameter is needed when
         * the two SourceMaps aren't in the same directory, and the SourceMap to be
         * applied contains relative source paths. If so, those relative source paths
         * need to be rewritten relative to the SourceMap.
         * If omitted, it is assumed that both SourceMaps are in the same directory;
         * thus, not needing any rewriting (Supplying '.' has the same effect).
         */
        applySourceMap(sourceMapConsumer, sourceFile?: string, sourceMapPath?: string): void;
        /**
         * Renders the source map being generated to JSON.
         */
        toJSON: () => any;
        /**
         * Renders the source map being generated to a string.
         */
        toString: () => string;
    };
    /**
     * Contains messages from plugins. For example, warnings or custom messages to
     * plugins communication. Add a warning using Result#warn() and get all warnings
     * using Result#warnings() method.
     */
    messages: {
        'type': string;
        plugin: string;
        browsers?: string[];
    }[];
    lastPlugin: postcss.Transformer;
    /**
     * Provides the result of the PostCSS transformations.
     */
    constructor(
        /**
         * The Processor instance used for this transformation.
         */
        processor: Processor, 
        /**
         * Contains Root node after all transformations.
         */
        root: Root, 
        /**
         * Options from the Processor#process(css, opts) or Root#toResult(opts) call
         * that produced this Result instance.
         */
        opts?: Result.Options);
    /**
     * Alias for Result#css property.
     */
    toString(): string;
    /**
     * Creates Warning and adds it to Result#messages.
     */
    warn(text: string, options?: Result.Options): void;
    /**
     * Filters Warning instances from [Result#messages].
     * @returns Warnings from plugins.
     */
    warnings(): {
        'type': string;
        plugin: string;
        browsers?: string[];
    }[];
    /**
     * Deprecated and will be removed in 5.0. Use result.opts.from instead.
     */
    from: string;
    /**
     * Deprecated and will be removed in 5.0. Use result.opts.to instead.
     */
    to: string;
}
declare module Result {
    interface Options extends Processor.ProcessOptions {
        /**
         * CSS node, that was a source of warning.
         */
        node?: Node;
        /**
         * Name of plugin that created this warning. Result#warn() will fill it
         * automatically with plugin.postcssPlugin value.
         */
        plugin?: string;
    }
}
export default Result;
