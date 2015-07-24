import CssSyntaxError from './css-syntax-error';
import Container from './container';
import Input from './Input';
import Root from './Root';
export interface Position {
    line: number;
    column: number;
}
export default class Node {
    /**
     * Returns a string representing the node's type.
     */
    'type': string;
    /**
     * The rule's full selector represented as a string. If there are multiple
     * comma-separated selectors, the entire group will be included.
     * This value will be cleaned of comments. If the source selector contained
     * comments, those comments will be available in the _selector.raw property.
     * If you have not changed the selector, the result of rule.toString() will
     * include the original raw selector value (comments and all).
     */
    selector: string;
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
     * The space symbols between the rule's last child and }, the block-closing curly brace.
     * The default value is \n if rule has children and an empty string ('') if it does not.
     */
    after: string;
    /**
     * true if rule's last child declaration is followed by an (optional) semicolon.
     * false if the semicolon is omitted.
     */
    semicolon: boolean;
    /**
     * Returns the node's parent node.
     */
    parent: Container;
    nodes: Node[];
    /**
     * Returns the input source of the node.
     */
    source: {
        input: Input;
        /**
         * The starting position of the node's source.
         */
        start?: Position;
        /**
         * The ending position of the node's source.
         */
        end?: Position;
    };
    constructor(defaults?: {
        parent?: Node;
        nodes?: Node[];
    });
    /**
     *
     * @param message Error description.
     * @param opts
     * @returns An error containing the original position of the node in the
     * source, showing line and column numbers and also a small excerpt to
     * facilitate debugging.
     */
    error(message: string, opts?: {
        /**
         * Plugin name that created this error. PostCSS will set it automatically.
         */
        plugin?: string;
    }): CssSyntaxError;
    /**
     * Removes the node from its parent, and cleans the parent property in the
     * node and its children.
     */
    removeSelf(): Node;
    replace(nodes: any): Node;
    /**
     * @returns A CSS string representing the node.
     */
    toString(): string;
    stringify(builder: any, semicolon?: boolean): void;
    /**
     * @param overrides New properties with which to override the clone.
     * @returns A clone of the node. The resulting cloned node and its (cloned)
     * children will have clean parent and code style properties.
     */
    clone(overrides?: {}): any;
    /**
     * Shortcut to clone the node and insert the resulting cloned node before
     * the current node.
     * @param overrides New properties with which to override the clone.
     */
    cloneBefore(overrides?: {}): any;
    /**
     * Shortcut to clone the node and insert the resulting cloned node after the
     * current node.
     * @param overrides New properties with which to override the clone.
     */
    cloneAfter(overrides?: {}): any;
    /**
     * Inserts another node before the current node and removes the current node.
     */
    replaceWith(otherNode: Node): Node;
    /**
     * Removes the node from its current parent and inserts it at the end of newParent.
     * This will clean the before and after code style properties from the node,
     * and replace them with the indentation style of newParent. It will also clean
     * the between property if newParent is in another Root.
     * @param newParent Container node where the current node will be removed.
     */
    moveTo(newParent: Container): Node;
    /**
     * Removes the node from its current parent and inserts it into a new parent
     * before otherNode. This will also clean the node's code style
     * properties just as node.moveTo(newParent) does.
     * @param otherNode Will be after current node after moving.
     */
    moveBefore(otherNode: Node): Node;
    /**
     * Removes the node from its current parent and inserts it into a new parent
     * after otherNode. This will also clean the node's code style
     * properties just as node.moveTo(newParent) does.
     * @param otherNode Will be before current node after moving.
     */
    moveAfter(otherNode: Node): Node;
    /**
     * @returns The next child of the node's parent or returns undefined if the
     * current node is the last child.
     */
    next: Node;
    /**
     * @returns The previous child of the node's parent or returns undefined if the
     * current node is the first child.
     */
    prev: Node;
    toJSON(): {};
    /**
     * @param prop Name or code style property.
     * @param detect Name of default value. It can be easily missed if the value
     * is the same as prop.
     * @returns a code style property value. If the node is missing the code
     * style property (because the node was manually built or cloned), PostCSS
     * will try to autodetect the code style property by looking at other nodes
     * in the tree.
     */
    style(prop: string, detect?: string): any;
    /**
     * @returns The Root instance of the node�s tree.
     */
    root: Root;
    cleanStyles(keepBetween?: boolean): void;
    stringifyRaw(prop: any): any;
}
