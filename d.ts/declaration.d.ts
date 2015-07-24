import Node from './node';
declare class Declaration extends Node implements Declaration.NewProps {
    /**
     * Represents a CSS declaration.
     */
    constructor(defaults?: Declaration.NewProps);
    'type': string;
    /**
     * The declaration's property name.
     */
    prop: string;
    /**
     * The declaration's value. This value will be cleaned of comments. If the
     * source value contained comments, those comments will be available in the
     * _value.raw property. If you have not changed the value, the result of
     * decl.toString() will include the original raw value (comments and all).
     */
    value: string;
    /**
     * The space symbols before the declaration. Default value is \n.
     */
    before: string;
    /**
     * The symbols between the declaration�s property and its value.
     * Default value is a colon.
     */
    between: string;
    /**
     * true if the declaration has an !important annotation. If there are comments
     * between the declaration's value and its !important annotation, they will be
     * available in the _important property.
     */
    important: boolean;
    _important: string;
    /**
     * @param overrides New properties with which to override the clone.
     * @returns A clone of the node. The resulting cloned node and its (cloned)
     * children will have clean parent and code style properties.
     */
    clone(overrides?: Declaration.NewProps): Declaration;
    stringify(builder: any, semicolon?: boolean): void;
    cleanStyles(keepBetween: boolean): void;
}
declare module Declaration {
    interface NewProps {
        /**
         * The declaration's property name.
         */
        prop: string;
        /**
         * The declaration's value. This value will be cleaned of comments. If the
         * source value contained comments, those comments will be available in the
         * _value.raw property. If you have not changed the value, the result of
         * decl.toString() will include the original raw value (comments and all).
         */
        value: string;
    }
}
export default Declaration;
