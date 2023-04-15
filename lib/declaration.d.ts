import Container from './container.js'
import Node from './node.js'

declare namespace Declaration {
  export interface DeclarationRaws extends Record<string, unknown> {
    /**
     * The space symbols before the node. It also stores `*`
     * and `_` symbols before the declaration (IE hack).
     */
    before?: string

    /**
     * The symbols between the property and value for declarations.
     */
    between?: string

    /**
     * The content of the important statement, if it is not just `!important`.
     */
    important?: string

    /**
     * Declaration value with comments.
     */
    value?: {
      value: string
      raw: string
    }
  }

  export interface DeclarationProps {
    /** Name of the declaration. */
    prop: string
    /** Value of the declaration. */
    value: string
    /** Whether the declaration has an `!important` annotation. */
    important?: boolean
    /** Information used to generate byte-to-byte equal node string as it was in the origin input. */
    raws?: DeclarationRaws
  }

  // eslint-disable-next-line @typescript-eslint/no-use-before-define
  export { Declaration_ as default }
}

/**
 * Represents a CSS declaration.
 *
 * ```js
 * Once (root, { Declaration }) {
 *   let color = new Declaration({ prop: 'color', value: 'black' })
 *   root.append(color)
 * }
 * ```
 *
 * ```js
 * const root = postcss.parse('a { color: black }')
 * const decl = root.first.first
 * decl.type       //=> 'decl'
 * decl.toString() //=> ' color: black'
 * ```
 */
declare class Declaration_ extends Node {
  type: 'decl'
  parent: Container | undefined
  raws: Declaration.DeclarationRaws

  /**
   * The declaration's property name.
   *
   * ```js
   * const root = postcss.parse('a { color: black }')
   * const decl = root.first.first
   * decl.prop //=> 'color'
   * ```
   */
  prop: string

  /**
   * The declaration’s value.
   *
   * This value will be cleaned of comments. If the source value contained
   * comments, those comments will be available in the `raws` property.
   * If you have not changed the value, the result of `decl.toString()`
   * will include the original raws value (comments and all).
   *
   * ```js
   * const root = postcss.parse('a { color: black }')
   * const decl = root.first.first
   * decl.value //=> 'black'
   * ```
   */
  value: string

  /**
   * `true` if the declaration has an `!important` annotation.
   *
   * ```js
   * const root = postcss.parse('a { color: black !important; color: red }')
   * root.first.first.important //=> true
   * root.first.last.important  //=> undefined
   * ```
   */
  important: boolean

  /**
   * `true` if declaration is declaration of CSS Custom Property
   * or Sass variable.
   *
   * ```js
   * const root = postcss.parse(':root { --one: 1 }')
   * let one = root.first.first
   * one.variable //=> true
   * ```
   *
   * ```js
   * const root = postcss.parse('$one: 1')
   * let one = root.first
   * one.variable //=> true
   * ```
   */
  variable: boolean

  constructor(defaults?: Declaration.DeclarationProps)
  assign(overrides: object | Declaration.DeclarationProps): this
  clone(overrides?: Partial<Declaration.DeclarationProps>): this
  cloneBefore(overrides?: Partial<Declaration.DeclarationProps>): this
  cloneAfter(overrides?: Partial<Declaration.DeclarationProps>): this
}

declare class Declaration extends Declaration_ {}

export = Declaration
