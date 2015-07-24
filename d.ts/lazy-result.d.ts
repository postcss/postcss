import Result from './result';
import postcss from './postcss';
import Processor from './processor';
import Root from './root';
import RSVP from 'es6-promise';
export default class LazyResult {
    private stringified;
    private processed;
    private result;
    private error;
    private plugin;
    private processing;
    /**
     * Promise proxy for result of PostCSS transformations.
     */
    constructor(processor: Processor, 
        /**
         * String with input CSS or any object with toString() method, like file stream.
         * Optionally, send Result instance and the processor will take the existing
         * [Root] parser from it.
         */
        css: string | {
        toString(): string;
    } | Result, options?: {
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
    });
    /**
     * @returns A Processor instance, which will be used for CSS transformations.
     */
    processor: Processor;
    /**
     * @returns Options from the Processor#process(css, opts) call that produced
     * this Result instance.
     */
    opts: Result.Options;
    /**
     * Processes input CSS through synchronous plugins, converts Root to CSS string.
     * This property will work only with synchronous plugins. If processor contains any
     * asynchronous plugins it will throw a error. You should use LazyResult#then() instead.
     * @returns Result#css.
     */
    css: string;
    /**
     * Processes input CSS through synchronous plugins. This property will work only
     * with synchronous plugins. If processor contains any asynchronous plugins it
     * will throw an error. You should use LazyResult#then() instead.
     * @returns Result#map.
     */
    map: {
        addMapping(mapping: {
            generated: {
                line: number;
                column: number;
            };
            original: {
                line: number;
                column: number;
            };
            source: string;
            name?: string;
        }): void;
        setSourceContent(sourceFile: string, sourceContent: string): void;
        applySourceMap(sourceMapConsumer: any, sourceFile?: string, sourceMapPath?: string): void;
        toJSON: () => any;
        toString: () => string;
    };
    /**
     * Processes input CSS through synchronous plugins and returns Result#root.
     * This property will work only with synchronous plugins. If processor contains
     * any asynchronous plugins it will throw an error. You should use
     * LazyResult#then() instead.
     */
    root: Root;
    /**
     * Processes input CSS through synchronous plugins and returns Result#messages.
     * This property will work only with synchronous plugins. If processor contains
     * any asynchronous plugins it will throw an error. You should use
     * LazyResult#then() instead.
     */
    messages: {
        'type': string;
        plugin: string;
        browsers?: string[];
    }[];
    /**
     * Processes input CSS through synchronous plugins and calls [Result#warnings()].
     * This property will work only with synchronous plugins. If processor contains
     * any asynchronous plugins it will throw a error. You should use
     * LazyResult#then() instead.
     */
    warnings(): {
        'type': string;
        plugin: string;
        browsers?: string[];
    }[];
    /**
     * Alias for LazyResult#css property.
     */
    toString(): string;
    /**
     * Processes input CSS through synchronous and asynchronous plugins and call
     * onFulfilled with Result instance. If a plugin throws an error, onRejected
     * callback will be executed.
     */
    then(onFulfilled: any, onRejected: any): RSVP.Promise<{}>;
    /**
     * Processes input CSS through synchronous and asynchronous plugins and call
     * onRejected on errors from any plugin.
     */
    catch(onRejected: any): RSVP.Promise<{}>;
    private handleError(error, plugin);
    private asyncTick(resolve, reject);
    private async();
    private sync();
    private run(plugin);
    stringify(): Result;
}
