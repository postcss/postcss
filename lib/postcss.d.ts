import { SourceMapGenerator, RawSourceMap } from 'source-map-js'

import Node_ = require('./node.js')
import Declaration_ = require('./declaration.js')
import Container_ = require('./container.js')
import Document_ = require('./document.js')
import Warning_ = require('./warning.js')
import Comment_ = require('./comment.js')
import AtRule_ = require('./at-rule.js')
import Input_ = require('./input.js')
import Result_ = require('./result.js')
import Root_ = require('./root.js')
import Rule_ = require('./rule.js')
import CssSyntaxError_ = require('./css-syntax-error.js')
import list = require('./list.js')
import LazyResult_ = require('./lazy-result.js')
import Processor_ = require('./processor.js')

type DocumentProcessor = (
  document: postcss.Document,
  helper: postcss.Helpers
) => Promise<void> | void
type RootProcessor = (root: postcss.Root, helper: postcss.Helpers) => Promise<void> | void
type DeclarationProcessor = (
  decl: postcss.Declaration,
  helper: postcss.Helpers
) => Promise<void> | void
type RuleProcessor = (rule: postcss.Rule, helper: postcss.Helpers) => Promise<void> | void
type AtRuleProcessor = (atRule: postcss.AtRule, helper: postcss.Helpers) => Promise<void> | void
type CommentProcessor = (
  comment: postcss.Comment,
  helper: postcss.Helpers
) => Promise<void> | void

interface Processors {
  /**
   * Will be called on `Document` node.
   *
   * Will be called again on children changes.
   */
  Document?: DocumentProcessor

  /**
   * Will be called on `Document` node, when all children will be processed.
   *
   * Will be called again on children changes.
   */
  DocumentExit?: DocumentProcessor

  /**
   * Will be called on `Root` node once.
   */
  Once?: RootProcessor

  /**
   * Will be called on `Root` node once, when all children will be processed.
   */
  OnceExit?: RootProcessor

  /**
   * Will be called on `Root` node.
   *
   * Will be called again on children changes.
   */
  Root?: RootProcessor

  /**
   * Will be called on `Root` node, when all children will be processed.
   *
   * Will be called again on children changes.
   */
  RootExit?: RootProcessor

  /**
   * Will be called on all `Declaration` nodes after listeners
   * for `Declaration` event.
   *
   * Will be called again on node or children changes.
   */
  Declaration?: DeclarationProcessor | { [prop: string]: DeclarationProcessor }

  /**
   * Will be called on all `Declaration` nodes.
   *
   * Will be called again on node or children changes.
   */
  DeclarationExit?:
    | DeclarationProcessor
    | { [prop: string]: DeclarationProcessor }

  /**
   * Will be called on all `Rule` nodes.
   *
   * Will be called again on node or children changes.
   */
  Rule?: RuleProcessor

  /**
   * Will be called on all `Rule` nodes, when all children will be processed.
   *
   * Will be called again on node or children changes.
   */
  RuleExit?: RuleProcessor

  /**
   * Will be called on all`AtRule` nodes.
   *
   * Will be called again on node or children changes.
   */
  AtRule?: AtRuleProcessor | { [name: string]: AtRuleProcessor }

  /**
   * Will be called on all `AtRule` nodes, when all children will be processed.
   *
   * Will be called again on node or children changes.
   */
  AtRuleExit?: AtRuleProcessor | { [name: string]: AtRuleProcessor }

  /**
   * Will be called on all `Comment` nodes.
   *
   * Will be called again on node or children changes.
   */
  Comment?: CommentProcessor

  /**
   * Will be called on all `Comment` nodes after listeners
   * for `Comment` event.
   *
   * Will be called again on node or children changes.
   */
  CommentExit?: CommentProcessor

  /**
   * Will be called when all other listeners processed the document.
   *
   * This listener will not be called again.
   */
  Exit?: RootProcessor
}

declare namespace postcss {
  type NodeErrorOptions = Node_.NodeErrorOptions
  type DeclarationProps = Declaration_.DeclarationProps
  type ContainerProps = Container_.ContainerProps
  type WarningOptions = Warning_.WarningOptions
  type DocumentProps = Document_.DocumentProps
  type FilePosition = Input_.FilePosition
  type CommentProps = Comment_.CommentProps
  type AtRuleProps = AtRule_.AtRuleProps
  type ChildProps = Node_.ChildProps
  type LazyResult = LazyResult_
  type ChildNode = Node_.ChildNode
  type NodeProps = Node_.NodeProps
  type RuleProps = Rule_.RuleProps
  type RootProps = Root_.RootProps
  type Position = Node_.Position
  type AnyNode = Node_.AnyNode
  type Message = Result_.Message
  type Source = Node_.Source
  type CssSyntaxError = CssSyntaxError_
  type Declaration = Declaration_
  type Processor = Processor_
  type Container = Container_
  type Document = Document_
  type Warning = Warning_
  type Comment = Comment_
  type AtRule = AtRule_
  type Result = Result_
  type Input = Input_
  type Node = Node_
  type Rule = Rule_
  type Root = Root_

  type SourceMap = SourceMapGenerator & {
    toJSON(): RawSourceMap
  }

  type Helpers = { result: Result; postcss: Postcss } & Postcss

  interface Plugin extends Processors {
    postcssPlugin: string
    prepare?: (result: Result) => Processors
  }

  interface PluginCreator<PluginOptions> {
    (opts?: PluginOptions): Plugin | Processor
    postcss: true
  }

  interface Transformer extends TransformCallback {
    postcssPlugin: string
    postcssVersion: string
  }

  interface TransformCallback {
    (root: Root, result: Result): Promise<void> | void
  }

  interface OldPlugin<T> extends Transformer {
    (opts?: T): Transformer
    postcss: Transformer
  }

  type AcceptedPlugin =
    | Plugin
    | PluginCreator<any>
    | OldPlugin<any>
    | TransformCallback
    | {
        postcss: TransformCallback | Processor
      }
    | Processor

  interface Parser<RootNode = Root | Document> {
    (
      css: string | { toString(): string },
      opts?: Pick<ProcessOptions, 'map' | 'from'>
    ): RootNode
  }

  interface Builder {
    (part: string, node?: AnyNode, type?: 'start' | 'end'): void
  }

  interface Stringifier {
    (node: AnyNode, builder: Builder): void
  }

  interface JSONHydrator {
    (data: object[]): Node[]
    (data: object): Node
  }

  interface Syntax {
    /**
     * Function to generate AST by string.
     */
    parse?: Parser

    /**
     * Class to generate string by AST.
     */
    stringify?: Stringifier
  }

  interface SourceMapOptions {
    /**
     * Indicates that the source map should be embedded in the output CSS
     * as a Base64-encoded comment. By default, it is `true`.
     * But if all previous maps are external, not inline, PostCSS will not embed
     * the map even if you do not set this option.
     *
     * If you have an inline source map, the result.map property will be empty,
     * as the source map will be contained within the text of `result.css`.
     */
    inline?: boolean

    /**
     * Source map content from a previous processing step (e.g., Sass).
     *
     * PostCSS will try to read the previous source map
     * automatically (based on comments within the source CSS), but you can use
     * this option to identify it manually.
     *
     * If desired, you can omit the previous map with prev: `false`.
     */
    prev?: string | boolean | object | ((file: string) => string)

    /**
     * Indicates that PostCSS should set the origin content (e.g., Sass source)
     * of the source map. By default, it is true. But if all previous maps do not
     * contain sources content, PostCSS will also leave it out even if you
     * do not set this option.
     */
    sourcesContent?: boolean

    /**
     * Indicates that PostCSS should add annotation comments to the CSS.
     * By default, PostCSS will always add a comment with a path
     * to the source map. PostCSS will not add annotations to CSS files
     * that do not contain any comments.
     *
     * By default, PostCSS presumes that you want to save the source map as
     * `opts.to + '.map'` and will use this path in the annotation comment.
     * A different path can be set by providing a string value for annotation.
     *
     * If you have set `inline: true`, annotation cannot be disabled.
     */
    annotation?: string | boolean | ((file: string, root: Root) => string)

    /**
     * Override `from` in map’s sources.
     */
    from?: string

    /**
     * Use absolute path in generated source map.
     */
    absolute?: boolean
  }

  interface ProcessOptions {
    /**
     * The path of the CSS source file. You should always set `from`,
     * because it is used in source map generation and syntax error messages.
     */
    from?: string

    /**
     * The path where you'll put the output CSS file. You should always set `to`
     * to generate correct source maps.
     */
    to?: string

    /**
     * Function to generate AST by string.
     */
    parser?: Syntax | Parser

    /**
     * Class to generate string by AST.
     */
    stringifier?: Syntax | Stringifier

    /**
     * Object with parse and stringify.
     */
    syntax?: Syntax

    /**
     * Source map options
     */
    map?: SourceMapOptions | boolean
  }

  interface Postcss {
    default: Postcss

    /**
     * Create a new `Processor` instance that will apply `plugins`
     * as CSS processors.
     *
     * ```js
     * let postcss = require('postcss')
     *
     * postcss(plugins).process(css, { from, to }).then(result => {
     *   console.log(result.css)
     * })
     * ```
     *
     * @param plugins PostCSS plugins.
     * @return Processor to process multiple CSS.
     */
    (plugins?: postcss.AcceptedPlugin[]): Processor
    (...plugins: postcss.AcceptedPlugin[]): Processor

    /**
     * Default function to convert a node tree into a CSS string.
     */
    stringify: Stringifier

    /**
     * Parses source css and returns a new `Root` or `Document` node,
     * which contains the source CSS nodes.
     *
     * ```js
     * // Simple CSS concatenation with source map support
     * const root1 = postcss.parse(css1, { from: file1 })
     * const root2 = postcss.parse(css2, { from: file2 })
     * root1.append(root2).toResult().css
     * ```
     */
    parse: Parser<Root>

    /**
     * Rehydrate a JSON AST (from `Node#toJSON`) back into the AST classes.
     *
     * ```js
     * const json = root.toJSON()
     * // save to file, send by network, etc
     * const root2  = postcss.fromJSON(json)
     * ```
     */
    fromJSON: JSONHydrator

    /**
     * Creates a new `Comment` node.
     *
     * @param defaults Properties for the new node.
     * @return New comment node
     */
    comment(defaults?: CommentProps): Comment

    /**
     * Creates a new `AtRule` node.
     *
     * @param defaults Properties for the new node.
     * @return New at-rule node.
     */
    atRule(defaults?: AtRuleProps): AtRule

    /**
     * Creates a new `Declaration` node.
     *
     * @param defaults Properties for the new node.
     * @return New declaration node.
     */
    decl(defaults?: DeclarationProps): Declaration

    /**
     * Creates a new `Rule` node.
     *
     * @param default Properties for the new node.
     * @return New rule node.
     */
    rule(defaults?: RuleProps): Rule

    /**
     * Creates a new `Root` node.
     *
     * @param defaults Properties for the new node.
     * @return New root node.
     */
    root(defaults?: RootProps): Root

    /**
     * Creates a new `Document` node.
     *
     * @param defaults Properties for the new node.
     * @return New document node.
     */
    document(defaults?: DocumentProps): Document

    CssSyntaxError: typeof CssSyntaxError_
    Declaration: typeof Declaration_
    Processor: typeof Processor_
    Container: typeof Container_
    Document: typeof Document_
    Warning: typeof Warning_
    Comment: typeof Comment_
    AtRule: typeof AtRule_
    Result: typeof Result_
    Input: typeof Input_
    Node: typeof Node_
    list: typeof list
    Rule: typeof Rule_
    Root: typeof Root_
  }
}

declare const postcss: postcss.Postcss

export = postcss
