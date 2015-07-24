import Declaration from './declaration';
import Comment from './comment';
import Node from './node';
import AtRule from './at-rule';
import Rule from './rule';
/**
 * An array containing the container's children.
 */
declare class Container extends Node {
    private indexes;
    private lastEach;
    nodes: Node[];
    protected stringifyContent(builder: any): void;
    protected stringifyBlock(builder: any, start: any): void;
    push(child: Node): Container;
    /**
     * Iterates through the container's immediate children, calling callback for
     * each child. Returning false within callback will break iteration. Unlike
     * the for {}-cycle or Array#forEach() this iterator is safe if you are
     * mutating the array of child nodes during iteration. PostCSS will adjust
     * the current index to match the mutations. This only iterates through the
     * container's immediate children. If you need to recursively iterate through
     * all the container's nodes, use container.eachInside().
     */
    each(callback: Container.EachCallback): boolean;
    /**
     * Recursively iterates through the container's children, those children's
     * children, etc., calling the callback function for each one. Like
     * container.each(), this method is safe to use if you are mutating arrays
     * during iteration. If you only need to iterate through the container's
     * immediate children, use container.each().
     */
    eachInside(callback: Container.EachCallback): boolean;
    /**
     * Recursively iterates through all declaration nodes within the container,
     * calling the callback function for each one. Like container.each(), this
     * method is safe to use if you are mutating arrays during iteration.
     * @param propFilter Filters declarations by property name. Only those
     * declarations whose property matches propFilter will be iterated over.
     */
    eachDecl(propFilter: string | RegExp, callback?: Container.EachDeclCallback): boolean;
    eachDecl(callback: Container.EachDeclCallback): boolean;
    /**
     * Recursively iterates through all rule nodes within the container, calling
     * the callback function for each one. Like container.each(), this method is
     * safe to use if you are mutating arrays during iteration.
     */
    eachRule(callback: Container.EachRuleCallback): boolean;
    /**
     * Recursively iterates through all at-rule nodes within the container,
     * calling the callback function for each one. Like container.each(), this
     * method is safe to use if you are mutating arrays during iteration.
     * @param nameFilter Filters at-rules by name. Only the at-rules whose name
     * matches the filter will be iterated over.
     */
    eachAtRule(nameFilter: string | RegExp, callback?: Container.EachAtRuleCallback): boolean;
    eachAtRule(callback: Container.EachAtRuleCallback): boolean;
    /**
     * Recursively iterates through all comment nodes within the container,
     * calling the callback function for each one. Like container.each(), this
     * method is safe to use if you are mutating arrays during iteration.
     */
    eachComment(callback: Container.EachCommentCallback): boolean;
    /**
     * Insert a new node to the end of the container.
     */
    append(node: Node): any;
    /**
     * Because each node class is identifiable by unique properties, use the
     * following shortcuts to create nodes in insert methods:
     *
     * root.append({ name: '@charset', params: '"UTF-8"' }); // at-rule
     * root.append({ selector: 'a' });                       // rule
     * rule.append({ prop: 'color', value: 'black' });       // declaration
     * rule.append({ text: 'Comment' })                      // comment
     */
    append(props: AtRule.NewProps | Rule.NewProps | Declaration.NewProps | Comment.NewProps): any;
    /**
     * A string containing the CSS of the new element can also be used. This
     * approach is slower than the other overloads.
     */
    append(css: string): any;
    /**
     * Insert a new node to the beginning of the container.
     */
    prepend(node: Node): any;
    /**
     * Because each node class is identifiable by unique properties, use the
     * following shortcuts to create nodes in insert methods:
     *
     * root.append({ name: '@charset', params: '"UTF-8"' }); // at-rule
     * root.append({ selector: 'a' });                       // rule
     * rule.append({ prop: 'color', value: 'black' });       // declaration
     * rule.append({ text: 'Comment' })                      // comment
     */
    prepend(props: AtRule.NewProps | Rule.NewProps | Declaration.NewProps | Comment.NewProps): any;
    /**
     * A string containing the CSS of the new element can also be used. This
     * approach is slower than the other overloads.
     */
    prepend(css: string): any;
    /**
     * Insert a new node before an existing node within the container.
     */
    insertBefore(existingNode: Node | number, node: Node): any;
    /**
     * Because each node class is identifiable by unique properties, use the
     * following shortcuts to create nodes in insert methods:
     *
     * root.append({ name: '@charset', params: '"UTF-8"' }); // at-rule
     * root.append({ selector: 'a' });                       // rule
     * rule.append({ prop: 'color', value: 'black' });       // declaration
     * rule.append({ text: 'Comment' })                      // comment
     */
    insertBefore(existingNode: Node | number, props: AtRule.NewProps | Rule.NewProps | Declaration.NewProps | Comment.NewProps): any;
    /**
     * A string containing the CSS of the new element can also be used. This
     * approach is slower than the other overloads.
     */
    insertBefore(existingNode: Node, css: string): any;
    /**
     * Insert a new node after an existing node within the container.
     */
    insertAfter(existingNode: Node | number, node: Node): any;
    /**
     * Because each node class is identifiable by unique properties, use the
     * following shortcuts to create nodes in insert methods:
     *
     * root.append({ name: '@charset', params: '"UTF-8"' }); // at-rule
     * root.append({ selector: 'a' });                       // rule
     * rule.append({ prop: 'color', value: 'black' });       // declaration
     * rule.append({ text: 'Comment' })                      // comment
     */
    insertAfter(existingNode: Node | number, props: AtRule.NewProps | Rule.NewProps | Declaration.NewProps | Comment.NewProps): any;
    /**
     * A string containing the CSS of the new element can also be used. This
     * approach is slower than the other overloads.
     */
    insertAfter(existingNode: Node, css: string): any;
    /**
     * Removes node from the container, and the parent properties of node and its children.
     * @param child Child or child's index.
     */
    remove(child: Node | number): Container;
    /**
     * Removes all children from the container, and cleans their parent properties.
     */
    removeAll(): Container;
    /**
     * Passes all declaration values within the container that match pattern
     * through callback, replacing those values with the returned result of callback.
     * This method is useful if you are using a custom unit or function and need
     * to iterate through all values.
     * @param searchValue Pattern that we need to replace.
     * @param options To speed up the search.
     * @param replaceValue String to replace pattern or callback that will return a
     * new value. The callback will receive the same arguments as those passed to
     * a function parameter of String#replace.
     */
    replaceValues(searchValue: string | RegExp, options: {
        /**
         * An array of property names. The method will only search for values that
         * match regexp within declarations of listed properties.
         */
        props?: string[];
        /**
         * A string that used to narrow down values and speed up the regexp search.
         * Searching every single value with a regexp can be slow. If you pass a
         * fast string, PostCSS will first check whether the value contains the
         * fast string; and only if it does will PostCSS check that value against
         * regexp. For example, instead of just checking for /\d+rem/ on all values,
         * set fast: 'rem' to first check whether a value has the rem unit, and
         * only if it does perform the regexp check.
         */
        fast?: string;
    }, replaceValue: Function | string): Container;
    replaceValues(searchValue: string | RegExp, replaceValue: string | Container.ReplaceCallback): Container;
    /**
     * Determines whether the specified callback function returns true for all nodes.
     */
    every(callback: (value: Node, indexedDb: number, nodes: Node[]) => boolean, thisArg?: any): boolean;
    /**
     * Determines whether the specified callback function returns true for any node.
     */
    some(callback: (value: Node, index: number, array: Node[]) => boolean, thisArg?: any): boolean;
    /**
     * @param child Child of current container.
     * @returns Child's index within the container's nodes array.
     */
    index(child: Node | number): number;
    first: Node;
    last: Node;
    normalize(node: Node | string, sample: Node, nodeType?: string): Node[];
    normalize(props: AtRule.NewProps | Rule.NewProps | Declaration.NewProps | Comment.NewProps, sample: Node, nodeType?: string): Node[];
    cleanStyles(keepBetween: boolean): void;
}
declare module Container {
    interface EachCallback {
        (node: Node, index?: number): boolean | void;
    }
    interface EachDeclCallback {
        (decl: Declaration, index?: number): boolean | void;
    }
    interface EachRuleCallback {
        (rule: Rule, index?: number): boolean | void;
    }
    interface EachAtRuleCallback {
        (atRule: AtRule, index?: number): boolean | void;
    }
    interface EachCommentCallback {
        (comment: Comment, index?: number): boolean | void;
    }
    interface ReplaceCallback {
        (substring: string, ...args: any[]): string;
    }
}
export default Container;
