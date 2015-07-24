import CssSyntaxError from './css-syntax-error';
import PreviousMap from './previous-map';
export default class Input {
    css: string;
    safe: boolean;
    /**
     * The absolute path to the CSS source file defined with the "from" option.
     */
    file: string;
    /**
     * The unique ID of the CSS source. Used if from option is not provided
     * (because PostCSS does not know the file path).
     */
    id: string;
    /**
     * The CSS source identifier. Contains input.file if the user set the from
     * option, or input.id if he/she did not.
     */
    'from': string;
    /**
     * Represents the input source map passed from a compilation step before
     * PostCSS (for example, from the Sass compiler).
     */
    map: PreviousMap;
    /**
     * Represents the source CSS.
     */
    constructor(css: string, options?: {
        safe?: boolean | any;
        from?: string;
    });
    error(message: string, line: number, column: number, opts?: {
        plugin?: string;
    }): CssSyntaxError;
    /**
     * Reads the input source map.
     * @returns A symbol position in the input source (e.g., in a Sass file that
     * was compiled to CSS before being passed to PostCSS).
     */
    origin(line: number, column: number): {
        file: string;
        line: any;
        column: any;
        source: any;
    };
    mapResolve(file: string): string;
}
