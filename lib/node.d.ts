import Declaration, { DeclarationProps } from './declaration.js'
import Comment, { CommentProps } from './comment.js'
import { Stringifier, Syntax } from './postcss.js'
import AtRule = require('./at-rule.js')
import { AtRuleProps } from './at-rule.js'
import Rule, { RuleProps } from './rule.js'
import Warning, { WarningOptions } from './warning.js'
import CssSyntaxError from './css-syntax-error.js'
import Result from './result.js'
import Input from './input.js'
import Root from './root.js'
import Document from './document.js'
import Container from './container.js'

declare namespace Node {
  export type ChildNode = AtRule.default | Rule | Declaration | Comment

  export type AnyNode =
    | AtRule.default
    | Rule
    | Declaration
    | Comment
    | Root
    | Document

  export type ChildProps =
    | AtRuleProps
    | RuleProps
    | DeclarationProps
    | CommentProps

  export interface Position {
    /**
     * Source offset in file. It starts from 0.
     */
    offset: number

    /**
     * Source line in file. In contrast to `offset` it starts from 1.
     */
    column: number

    /**
     * Source column in file.
     */
    line: number
  }

  export interface Range {
    /**
     * Start position, inclusive.
     */
    start: Position

    /**
     * End position, exclusive.
     */
    end: Position
  }

  /**
   * Source represents an interface for the {@link Node.source} property.
   */
  export interface Source {
    /**
     * The source file from where a node has originated.
     */
    input: Input

    /**
     * The inclusive starting position for the source
     * code of a node.
     */
    start?: Position

    /**
     * The inclusive ending position for the source
     * code of a node.
     */
    end?: Position
  }

  /**
   * NodeProps represents an interface for an object received
   * as parameter by Node class constructor.
   */
  export interface NodeProps {
    source?: Source
  }

  export interface NodeErrorOptions {
    /**
     * Plugin name that created this error. PostCSS will set it automatically.
     */
    plugin?: string
    /**
     * A word inside a node's string, that should be highlighted as source
     * of error.
     */
    word?: string
    /**
     * An index inside a node's string that should be highlighted as source
     * of error.
     */
    index?: number
    /**
     * An ending index inside a node's string that should be highlighted as
     * source of error.
     */
    endIndex?: number
  }

  // eslint-disable-next-line @typescript-eslint/no-shadow
  class Node extends Node_ {}
  export { Node as default }
}

/**
 * `Node` represents an abstract class that handles common
 * methods for other CSS abstract syntax tree nodes.
 *
 * Any node that represents CSS selector or value should
 * not extend the `Node` class.
 */
declare abstract class Node_ {
  /**
   * The property `type` represents type of a node in
   * an abstract syntax tree.
   *
   * A type of node helps in identification of a node
   * and perform operation based on it's type.
   *
   * ```js
   * const declaration = new Declaration({
   *   prop: 'color',
   *   value: 'black'
   * })
   *
   * console.log(declaration.type) //=> 'decl'
   * ```
   */
  type: string

  /**
   * The property `parent` represents parent of the
   * current node.
   *
   * ```js
   * console.log(root.nodes[0].parent === root) //=> true
   * ```
   */
  parent: Document | Container | undefined

  /**
   * The property `source` represents information related
   * to origin of a node and is required for generating
   * source maps.
   *
   * The nodes that are created manually using the public APIs
   * provided by PostCSS will have `source` undefined and
   * will be absent in the source map.
   *
   * For this reason, the plugin developer should consider
   * duplicating nodes as the duplicate node will have the
   * same source as the original node by default or assign
   * source to a node created manually.
   *
   * ```js
   * console.log(decl.source.input.from) //=> '/home/ai/source.css'
   * console.log(decl.source.start)      //=> { line: 10, column: 2 }
   * console.log(decl.source.end)        //=> { line: 10, column: 12 }
   * ```
   *
   * ```js
   * // Incorrect method, source not specified!
   * const prefixed = postcss.decl({
   *   prop: '-moz-' + decl.prop,
   *   value: decl.value
   * })
   *
   * // Correct method, source is inherited when duplicating.
   * const prefixed = decl.clone({
   *   prop: '-moz-' + decl.prop
   * })
   * ```
   *
   * ```js
   * if (atrule.name === 'add-link') {
   *   const rule = postcss.rule({
   *     selector: 'a',
   *     source: atrule.source
   *   })
   *
   *  atrule.parent.insertBefore(atrule, rule)
   * }
   * ```
   */
  source?: Node.Source

  /**
   * The property `raws` represents unnecessary whitespace
   * and characters present in the css source code.
   *
   * Information to generate byte-to-byte equal node string as it was
   * in the origin input.
   *
   * The properties of the raws object are decided by parser,
   * the default parser uses the following properties:
   *
   * * `before`: the space symbols before the node. It also stores `*`
   *   and `_` symbols before the declaration (IE hack).
   * * `after`: the space symbols after the last child of the node
   *   to the end of the node.
   * * `between`: the symbols between the property and value
   *   for declarations, selector and `{` for rules, or last parameter
   *   and `{` for at-rules.
   * * `semicolon`: contains true if the last child has
   *   an (optional) semicolon.
   * * `afterName`: the space between the at-rule name and its parameters.
   * * `left`: the space symbols between `/*` and the comment’s text.
   * * `right`: the space symbols between the comment’s text
   *   and <code>*&#47;</code>.
   * - `important`: the content of the important statement,
   *   if it is not just `!important`.
   *
   * PostCSS filters out the comments inside selectors, declaration values
   * and at-rule parameters but it stores the origin content in raws.
   *
   * ```js
   * const root = postcss.parse('a {\n  color:black\n}')
   * console.log(root.first.first.raws) //=> { before: '\n  ', between: ':' }
   * ```
   */
  raws: any

  constructor(defaults?: object)

  /**
   * The Node.error method creates an instance of the
   * class `CssSyntaxError` and parameters passed to
   * this method are assigned to the error instance.
   *
   * The error instance will have description for the
   * error, original position of the node in the
   * source, showing line and column number.
   *
   * If any previous map is present, it would be used
   * to get original position of the source.
   *
   * The Previous Map here is referred to the source map
   * generated by previous compilation, example: Less,
   * Stylus and Sass.
   *
   * This method returns the error instance instead of
   * throwing it.
   *
   * ```js
   * if (!variables[name]) {
   *   throw decl.error(`Unknown variable ${name}`, { word: name })
   *   // CssSyntaxError: postcss-vars:a.sass:4:3: Unknown variable $black
   *   //   color: $black
   *   // a
   *   //          ^
   *   //   background: white
   * }
   * ```
   *
   * @param message Description for the error instance.
   * @param options Options for the error instance.
   *
   * @return Error instance is returned.
   */
  error(message: string, options?: Node.NodeErrorOptions): CssSyntaxError

  /**
   * The Node.warn method is a wrapper for Result#warn,
   * providing convenient way of generating warnings.
   *
   * ```js
   *   Declaration: {
   *     bad: (decl, { result }) => {
   *       decl.warn(result, 'Deprecated property: bad')
   *     }
   *   }
   * ```
   *
   * @param result The `Result` instance that will receive the warning.
   * @param message Description for the warning.
   * @param options Options for the warning.
   *
   * @return `Warning` instance is returned
   */
  warn(result: Result, message: string, options?: WarningOptions): Warning

  /**
   * The `Node.remove` method removes the node from its parent
   * and deletes its parent property.
   *
   * ```js
   * if (decl.prop.match(/^-webkit-/)) {
   *   decl.remove()
   * }
   * ```
   *
   * @return `this` for method chaining.
   */
  remove(): this

  /**
   * The `Node.toString()` method compiles the node to
   * browser readable cascading style sheets string
   * depending on it's type.
   *
   * ```js
   * console.log(new Rule({ selector: 'a' }).toString()) //=> "a {}"
   * ```
   *
   * @param stringifier A syntax to use in string generation.
   * @return CSS string of this node.
   */
  toString(stringifier?: Stringifier | Syntax): string

  /**
   * The `Node.assign` method assigns properties to an existing
   * node instance.
   *
   * ```js
   * decl.assign({ prop: 'word-wrap', value: 'break-word' })
   * ```
   *
   * @param overrides New properties to override the node.
   *
   * @return `this` for method chaining.
   */
  assign(overrides: object): this

  /**
   * The `Node.clone` method creates clone of an existing node,
   * which includes all the properties and their values, that
   * includes `raws` but not `type`.
   *
   * ```js
   * decl.raws.before    //=> "\n  "
   * const cloned = decl.clone({ prop: '-moz-' + decl.prop })
   * cloned.raws.before  //=> "\n  "
   * cloned.toString()   //=> -moz-transform: scale(0)
   * ```
   *
   * @param overrides New properties to override in the clone.
   *
   * @return Duplicate of the node instance.
   */
  clone(overrides?: object): Node_

  /**
   * Shortcut to clone the node and insert the resulting cloned node
   * before the current node.
   *
   * ```js
   * decl.cloneBefore({ prop: '-moz-' + decl.prop })
   * ```
   *
   * @param overrides Mew properties to override in the clone.
   *
   * @return New node
   */
  cloneBefore(overrides?: object): this

  /**
   * Shortcut to clone the node and insert the resulting cloned node
   * after the current node.
   *
   * @param overrides New properties to override in the clone.
   * @return New node.
   */
  cloneAfter(overrides?: object): this

  /**
   * Inserts node(s) before the current node and removes the current node.
   *
   * ```js
   * AtRule: {
   *   mixin: atrule => {
   *     atrule.replaceWith(mixinRules[atrule.params])
   *   }
   * }
   * ```
   *
   * @param nodes Mode(s) to replace current one.
   * @return Current node to methods chain.
   */
  replaceWith(
    ...nodes: (
      | Node.ChildNode
      | Node.ChildProps
      | Node.ChildNode[]
      | Node.ChildProps[]
    )[]
  ): this

  /**
   * Returns the next child of the node’s parent.
   * Returns `undefined` if the current node is the last child.
   *
   * ```js
   * if (comment.text === 'delete next') {
   *   const next = comment.next()
   *   if (next) {
   *     next.remove()
   *   }
   * }
   * ```
   *
   * @return Next node.
   */
  next(): Node.ChildNode | undefined

  /**
   * Returns the previous child of the node’s parent.
   * Returns `undefined` if the current node is the first child.
   *
   * ```js
   * const annotation = decl.prev()
   * if (annotation.type === 'comment') {
   *   readAnnotation(annotation.text)
   * }
   * ```
   *
   * @return Previous node.
   */
  prev(): Node.ChildNode | undefined

  /**
   * Insert new node before current node to current node’s parent.
   *
   * Just alias for `node.parent.insertBefore(node, add)`.
   *
   * ```js
   * decl.before('content: ""')
   * ```
   *
   * @param newNode New node.
   * @return This node for methods chain.
   */
  before(newNode: Node | Node.ChildProps | string | Node[]): this

  /**
   * Insert new node after current node to current node’s parent.
   *
   * Just alias for `node.parent.insertAfter(node, add)`.
   *
   * ```js
   * decl.after('color: black')
   * ```
   *
   * @param newNode New node.
   * @return This node for methods chain.
   */
  after(newNode: Node | Node.ChildProps | string | Node[]): this

  /**
   * Finds the Root instance of the node’s tree.
   *
   * ```js
   * root.nodes[0].nodes[0].root() === root
   * ```
   *
   * @return Root parent.
   */
  root(): Root

  /**
   * Returns a `Node.raws` value. If the node is missing
   * the code style property (because the node was manually built or cloned),
   * PostCSS will try to autodetect the code style property by looking
   * at other nodes in the tree.
   *
   * ```js
   * const root = postcss.parse('a { background: white }')
   * root.nodes[0].append({ prop: 'color', value: 'black' })
   * root.nodes[0].nodes[1].raws.before   //=> undefined
   * root.nodes[0].nodes[1].raw('before') //=> ' '
   * ```
   *
   * @param prop        Name of code style property.
   * @param defaultType Name of default value, it can be missed
   *                    if the value is the same as prop.
   * @return {string} Code style value.
   */
  raw(prop: string, defaultType?: string): string

  /**
   * Clear the code style properties for the node and its children.
   *
   * ```js
   * node.raws.before  //=> ' '
   * node.cleanRaws()
   * node.raws.before  //=> undefined
   * ```
   *
   * @param keepBetween Keep the `raws.between` symbols.
   */
  cleanRaws(keepBetween?: boolean): void

  /**
   * Fix circular links on `JSON.stringify()`.
   *
   * @return Cleaned object.
   */
  toJSON(): object

  /**
   * Convert string index to line/column.
   *
   * @param index The symbol number in the node’s string.
   * @return Symbol position in file.
   */
  positionInside(index: number): Node.Position

  /**
   * Get the position for a word or an index inside the node.
   *
   * @param opts Options.
   * @return Position.
   */
  positionBy(opts?: Pick<WarningOptions, 'word' | 'index'>): Node.Position

  /**
   * Get the range for a word or start and end index inside the node.
   * The start index is inclusive; the end index is exclusive.
   *
   * @param opts Options.
   * @return Range.
   */
  rangeBy(
    opts?: Pick<WarningOptions, 'word' | 'index' | 'endIndex'>
  ): Node.Range
}

declare class Node extends Node_ { }

export = Node
