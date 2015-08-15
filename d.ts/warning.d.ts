import postcss from './postcss';
import Node from './node';
export default class Warning implements postcss.Warning {
    /**
     * Contains the warning message.
     */
    text: string;
    type: string;
    /**
     * Contains name of plugin that created this warning. When you call
     * Node#warn(), it will fill this property automatically.
     */
    plugin: string;
    /**
     * The CSS node that caused the warning.
     */
    node: Node;
    /**
     * Line in input file with this warning source.
     */
    line: number;
    /**
     * Column in input file with this warning source.
     */
    column: number;
    /**
     * Warning from plugins. It can be created using Node#warn().
     */
    constructor(
        /**
         * Contains the warning message.
         */
        text: string, options?: postcss.WarningOptions);
    /**
     * @returns Error position, message.
     */
    toString(): string;
}
