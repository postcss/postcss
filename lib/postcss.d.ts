import { Position, Source, ChildNode, NodeProps, ChildProps } from './node.js'
import Declaration, { DeclarationProps } from './declaration.js'
import Root, { Event, RootProps } from './root.js'
import Comment, { CommentProps } from './comment.js'
import AtRule, { AtRuleProps } from './at-rule.js'
import Result, { Message } from './result.js'
import Rule, { RuleProps } from './rule.js'
import { ContainerProps } from './container.js'
import { WarningOptions } from './warning.js'
import { FilePosition } from './input.js'
import LazyResult from './lazy-result.js'
import Processor from './processor.js'
import { List } from './list.js'

export {
  WarningOptions,
  FilePosition,
  Position,
  Source,
  ChildNode,
  Message,
  Event,
  NodeProps,
  DeclarationProps,
  ContainerProps,
  CommentProps,
  RuleProps,
  ChildProps,
  AtRuleProps,
  RootProps
}

interface Transformer extends TransformCallback {
  postcssPlugin: string
  postcssVersion: string
}

interface TransformCallback {
  (root: Root, result: Result): Promise<void> | void
}

interface PluginInitializer<T> {
  (pluginOptions?: T): TransformCallback
}

export interface Plugin<T> extends Transformer {
  (opts?: T): Transformer
  postcss: Transformer
  process: (
    css:
      | string
      | {
          toString(): string
        }
      | Result,
    processOpts?: ProcessOptions,
    pluginOpts?: T
  ) => LazyResult
}

export type AcceptedPlugin =
  | Plugin<any>
  | TransformCallback
  | {
      postcss: TransformCallback | Processor
    }
  | Processor

export interface Parser {
  (
    css: string | { toString(): string },
    opts?: Pick<ProcessOptions, 'map' | 'from'>
  ): Root
}

export interface Builder {
  (part: string, node?: Node, type?: 'start' | 'end'): void
}

export interface Stringifier {
  (node: Node, builder: Builder): void
}

export interface Syntax {
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
  prev?: any

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
  annotation?: string | boolean

  /**
   * Override `from` in map’s sources.
   */
  from?: string
}

export interface ProcessOptions {
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
  parser?: Parser

  /**
   * Class to generate string by AST.
   */
  stringifier?: Stringifier

  /**
   * Object with parse and stringify.
   */
  syntax?: Syntax

  /**
   * Source map options
   */
  map?: SourceMapOptions | boolean
}

export interface Postcss {
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
   * @param plugins PostCSS plugins
   * @return Processor to process multiple CSS.
   */
  (plugins?: AcceptedPlugin[]): Processor
  (...plugins: AcceptedPlugin[]): Processor

  /**
   * Creates a PostCSS plugin with a standard API.
   *
   * The newly-wrapped function will provide both the name and PostCSS
   * version of the plugin.
   *
   * ```js
   * const processor = postcss([replace])
   * processor.plugins[0].postcssPlugin  //=> 'postcss-replace'
   * processor.plugins[0].postcssVersion //=> '6.0.0'
   * ```
   *
   * The plugin function receives 2 arguments: `Root`
   * and `Result` instance. The function should mutate the provided
   * `Root` node. Alternatively, you can create a new `Root` node
   * and override the `result.root` property.
   *
   * ```js
   * const cleaner = postcss.plugin('postcss-cleaner', () => {
   *   return (root, result) => {
   *     result.root = postcss.root()
   *   }
   * })
   * ```
   *
   * As a convenience, plugins also expose a `process` method so that you can use
   * them as standalone tools.
   *
   * ```js
   * cleaner.process(css, processOpts, pluginOpts)
   * // This is equivalent to:
   * postcss([ cleaner(pluginOpts) ]).process(css, processOpts)
   * ```
   *
   * Asynchronous plugins should return a `Promise` instance.
   *
   * ```js
   * postcss.plugin('postcss-import', () => {
   *   return (root, result) => {
   *     return new Promise( (resolve, reject) => {
   *       fs.readFile('base.css', (base) => {
   *         root.prepend(base)
   *         resolve()
   *       })
   *     })
   *   }
   * })
   * ```
   *
   * Add warnings using the `Node#warn` method.
   * Send data to other plugins using the `Result#messages` array.
   *
   * ```js
   * postcss.plugin('postcss-caniuse-test', () => {
   *   return (root, result) => {
   *     root.walkDecls(decl => {
   *       if (!caniuse.support(decl.prop)) {
   *         decl.warn(result, 'Some browsers do not support ' + decl.prop)
   *       }
   *     })
   *   }
   * })
   * ```
   *
   * @param name        PostCSS plugin name. Same as in `name`
   *                    property in `package.json`. It will be saved
   *                    in `plugin.postcssPlugin` property.
   * @param initializer Will receive plugin options
   *                    and should return plugin function.
   *
   * @return PostCSS plugin.
   */
  plugin<T>(name: string, initializer: PluginInitializer<T>): Plugin<T>

  /**
   * Default function to convert a node tree into a CSS string.
   */
  stringify: Stringifier

  /**
   * Parses source css and returns a new `Root` node,
   * which contains the source CSS nodes.
   *
   * ```js
   * // Simple CSS concatenation with source map support
   * const root1 = postcss.parse(css1, { from: file1 })
   * const root2 = postcss.parse(css2, { from: file2 })
   * root1.append(root2).toResult().css
   * ```
   */
  parse: Parser

  /**
   * Contains the `list` module.
   *
   * ```js
   * postcss.list.space('5px calc(10% + 5px)') //=> ['5px', 'calc(10% + 5px)']
   * ```
   */
  list: List

  /**
   * Creates a new `Comment` node.
   *
   * ```js
   * postcss.comment({ text: 'test' })
   * ```
   *
   * @param defaults Properties for the new node.
   * @return New comment node
   */
  comment(defaults?: CommentProps): Comment

  /**
   * Creates a new `AtRule` node.
   *
   * ```js
   * postcss.atRule({ name: 'charset' }).toString() //=> "@charset"
   * ```
   *
   * @param defaults Properties for the new node.
   * @return New at-rule node.
   */
  atRule(defaults?: AtRuleProps): AtRule

  /**
   * Creates a new `Declaration` node.
   *
   * ```js
   * postcss.decl({ prop: 'color', value: 'red' }).toString() //=> "color: red"
   * ```
   *
   * @param defaults Properties for the new node.
   * @return New declaration node.
   */
  decl(defaults?: DeclarationProps): Declaration

  /**
   * Creates a new `Rule` node.
   *
   * ```js
   * postcss.rule({ selector: 'a' }).toString() //=> "a {\n}"
   * ```
   *
   * @param default Properties for the new node.
   * @return New rule node.
   */
  rule(defaults?: RuleProps): Rule

  /**
   * Creates a new `Root` node.
   *
   * ```js
   * postcss.root({ after: '\n' }).toString() //=> "\n"
   * ```
   *
   * @param defaults Properties for the new node.
   * @return New root node.
   */
  root(defaults?: RootProps): Root
}

declare const postcss: Postcss

export default postcss
