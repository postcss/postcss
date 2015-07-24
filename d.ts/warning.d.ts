import Node from './node';
export default class Warning implements WarningProps {
    /**
     * Contains warning message.
     */
    text: string;
    'type': string;
    /**
     * Contains name of plugin that created this warning. When you call Result#warn(),
     * it will fill this property automatically.
     */
    plugin: string;
    /**
     * The CSS node that caused the warning.
     */
    node: Node;
    /**
     * Warning from plugins. It can be created using Result#warn().
     */
    constructor(
        /**
         * Contains warning message.
         */
        text: string, options?: WarningProps);
    /**
     * @returns String with error position, message.
     */
    toString(): string;
}
export interface WarningProps {
    /**
     * Contains name of plugin that created this warning. When you call Result#warn(),
     * it will fill this property automatically.
     */
    plugin?: string;
    /**
     * The CSS node that caused the warning.
     */
    node?: Node;
}
