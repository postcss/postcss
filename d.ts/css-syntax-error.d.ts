export default class CssSyntaxError implements SyntaxError {
    /**
     * Contains full error text by GNU error format.
     */
    message: string;
    /**
     * Contains source line of error.
     */
    line: number;
    /**
     * Contains source column of error.
     */
    column: number;
    /**
     * Contains source code of broken file.
     */
    source: string;
    /**
     * Contains absolute path to broken file. If used, set "from" option to parser.
     */
    file: string;
    /**
     * Contains PostCSS plugin name if error did not come from CSS parser.
     */
    plugin: string;
    name: string;
    /**
     * Contains only the error description.
     */
    reason: string;
    private columnNumber;
    private description;
    private lineNumber;
    private fileName;
    generated: {
        line: number;
        column: number;
        source: string;
        file?: string;
    };
    /**
     * CSS parser throws this error for broken CSS.
     */
    constructor(
        /**
         * Contains full error text by GNU error format.
         */
        message: string, 
        /**
         * Contains source line of error.
         */
        line?: number, 
        /**
         * Contains source column of error.
         */
        column?: number, 
        /**
         * Contains source code of broken file.
         */
        source?: string, 
        /**
         * Contains absolute path to broken file. If used, set "from" option to parser.
         */
        file?: string, 
        /**
         * Contains PostCSS plugin name if error did not come from CSS parser.
         */
        plugin?: string);
    setMessage(): void;
    /**
     * @param color Color errors in red. By default, PostCSS will use
     * process.stdout.isTTY and process.env.NODE_DISABLE_COLORS.
     * @returns A few lines of CSS source that caused the error. If CSS has input
     * source map without sourceContent, this method will return an empty string.
     */
    showSourceCode(color?: boolean): string;
    highlight(color: boolean): string;
    setMozillaProps(): void;
    /**
     * @returns Error position, message and source code of broken part.
     */
    toString(): string;
}
