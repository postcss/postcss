import Container from './container';
declare class Rule extends Container implements Rule.NewProps {
    /**
     * Represents a CSS rule: a selector followed by a declaration block.
     */
    constructor(defaults?: Rule.NewProps);
    'type': string;
    /**
     * The rule's full selector. If there are multiple comma-separated selectors,
     * the entire group will be included.
     */
    selector: string;
    /**
     * @param overrides New properties with which to override the clone.
     * @returns A clone of the node. The resulting cloned node and its (cloned)
     * children will have clean parent and code style properties.
     */
    clone(overrides?: Rule.NewProps): Rule;
    /**
     * An array containing the rule's individual selectors.
     * Groups of selectors are split at commas.
     */
    selectors: string[];
    /**
     * The space symbols before the rule. The default value is \n, except for
     * first rule in root, whose before property is empty.
     */
    before: string;
    /**
     * The space symbols between the rule's selectors and {, the block-opening curly brace.
     * The default value is a single space.
     */
    between: string;
    /**
     * The space symbols between the rule's last child and }, the block-closing curly brace.
     * The default value is \n if rule has children and an empty string ('') if it does not.
     */
    after: string;
    /**
     * true if rule's last child declaration is followed by an (optional) semicolon.
     * false if the semicolon is omitted.
     */
    semicolon: boolean;
    stringify(builder: any): void;
}
declare module Rule {
    interface NewProps {
        /**
     * The rule's full selector. If there are multiple comma-separated selectors,
     * the entire group will be included.
     */
        selector: string;
    }
}
export default Rule;
