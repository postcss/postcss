import Container, { ContainerProps } from './container.js'
import { ProcessOptions } from './postcss.js'
import { ChildNode } from './node.js'
import Declaration from './declaration.js'
import Comment from './comment.js'
import AtRule from './at-rule.js'
import Result from './result.js'
import Rule from './rule.js'

interface RootRaws {
  /**
   * The space symbols after the last child to the end of file.
   */
  after?: string

  /**
   * Is the last child has an (optional) semicolon.
   */
  semicolon?: boolean
}

export interface RootProps extends ContainerProps {
  raws?: RootRaws
}

export type Event =
  | 'atrule'
  | 'atrule.enter'
  | 'atrule.exit'
  | 'rule'
  | 'rule.enter'
  | 'rule.exit'
  | 'decl'
  | 'decl.enter'
  | 'decl.exit'
  | 'comment'
  | 'comment.enter'
  | 'comment.exit'

interface EventOptions {
  'atrule': AtRule
  'atrule.enter': AtRule
  'atrule.exit': AtRule
  'rule': Rule
  'rule.enter': Rule
  'rule.exit': Rule
  'decl': Declaration
  'decl.enter': Declaration
  'decl.exit': Declaration
  'comment': Comment
  'comment.enter': Comment
  'comment.exit': Comment
}

/**
 * Represents a CSS file and contains all its parsed nodes.
 *
 * ```js
 * const root = postcss.parse('a{color:black} b{z-index:2}')
 * root.type         //=> 'root'
 * root.nodes.length //=> 2
 * ```
 */
export default class Root extends Container {
  type: 'root'
  parent: undefined
  raws: RootRaws

  constructor (defaults?: RootProps)

  /**
   * Returns a `Result` instance representing the root’s CSS.
   *
   * ```js
   * const root1 = postcss.parse(css1, { from: 'a.css' })
   * const root2 = postcss.parse(css2, { from: 'b.css' })
   * root1.append(root2)
   * const result = root1.toResult({ to: 'all.css', map: true })
   * ```
   *
   * @param opts Options with only `to` and `map` keys.
   * @return Result with current root’s CSS.
   */
  toResult (options?: Pick<ProcessOptions, 'from' | 'map'>): Result

  /**
   * Add visitor for next PostCSS walk.
   *
   * Visitor subscribes for events. Each event contain node type (`atrule`,
   * `rule`, `decl`, `comment`) and phase (`enter`, `exit`) separated with dot.
   * The default phase is `enter`. As result possible events could be like
   * `comment.enter`, `decl.exit` or `rule` (equal to `rule.enter`).
   *
   * PostCSS will walk through CSS AST and call visitor according current node.
   * Visitor will receive node and node’s index.
   *
   * ```js
   * css.on('decl', (node, index) => {
   *   if (node.prop === 'will-change') {
   *     node.cloneBefore({ prop: 'backface-visibility', value: 'hidden' })
   *   }
   * })
   * ```
   *
   * @param type The type of the node and phase.
   * @param visitor Function receives node and index.
   * @return The root node to bind another listener.
   */
  on<E extends keyof EventOptions> (
    event: E,
    visitor: (node: EventOptions[E], index: number) => void
  ): this
}
