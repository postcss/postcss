import Container from './container';
declare class AtRule extends Container implements AtRule.NewProps {
    /**
     * Represents an at-rule.
     */
    constructor(defaults?: AtRule.NewProps);
    'type': string;
    /**
     * The identifier that immediately follows the @.
     */
    name: string;
    /**
     * These are the values that follow the at-rule's name, but precede any {}
     * block. The spec refers to this area as the at-rule's "prelude".
     */
    params: string;
    /**
     * The space symbols before the at-rule. The default value is \n; except, for
     * the first rule in a Root, whose before property is empty.
     */
    before: string;
    /**
     * The space symbols between the at-rule's name and its parameters. The
     * default value is a space.
     */
    afterName: string;
    /**
     * The space symbols between the at-rule's parameters and {, the
     * block-opening curly brace. The default value is a space.
     */
    between: string;
    /**
     * The space symbols between the at-rule's last child and }, the block-closing curly brace.
     * The default value is \n if the at-rule has children, and an empty string ('') if it does not.
     */
    after: string;
    /**
     * true if at-rule's last child declaration is followed by an (optional) semicolon.
     * false if the semicolon is omitted.
     */
    semicolon: boolean;
    /**
     * @param overrides New properties with which to override the clone.
     * @returns A clone of the node. The resulting cloned node and its (cloned)
     * children will have clean parent and code style properties.
     */
    clone(overrides?: AtRule.NewProps): AtRule;
    stringify(builder: any, semicolon?: boolean): void;
    append(child: any): any;
    prepend(child: any): any;
    insertBefore(exist: any, add: any): any;
    insertAfter(exist: any, add: any): any;
}
declare module AtRule {
    interface NewProps {
        /**
         * The identifier that immediately follows the @.
         */
        name: string;
        /**
         * These are the values that follow the at-rule's name, but precede any {}
         * block. The spec refers to this area as the at-rule's "prelude".
         */
        params: string;
    }
}
export default AtRule;
