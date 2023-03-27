import Container = require('./container.js')

interface RuleRaws extends Record<string, unknown> {
  /**
   * The space symbols before the node. It also stores `*`
   * and `_` symbols before the declaration (IE hack).
   */
  before?: string

  /**
   * The space symbols after the last child of the node to the end of the node.
   */
  after?: string

  /**
   * The symbols between the selector and `{` for rules.
   */
  between?: string

  /**
   * Contains `true` if the last child has an (optional) semicolon.
   */
  semicolon?: boolean

  /**
   * Contains `true` if there is semicolon after rule.
   */
  ownSemicolon?: string

  /**
   * The rule’s selector with comments.
   */
  selector?: {
    value: string
    raw: string
  }
}

declare namespace Rule {
  export interface RuleProps extends Container.ContainerProps {
    /** Selector or selectors of the rule. */
    selector?: string
    /** Selectors of the rule represented as an array of strings. */
    selectors?: string[]
    /** Information used to generate byte-to-byte equal node string as it was in the origin input. */
    raws?: RuleRaws
  }

  // eslint-disable-next-line @typescript-eslint/no-shadow
  class Rule extends Rule_ {}
  export { Rule as default }
}

/**
 * Represents a CSS rule: a selector followed by a declaration block.
 *
 * ```js
 * Once (root, { Rule }) {
 *   let a = new Rule({ selector: 'a' })
 *   a.append(…)
 *   root.append(a)
 * }
 * ```
 *
 * ```js
 * const root = postcss.parse('a{}')
 * const rule = root.first
 * rule.type       //=> 'rule'
 * rule.toString() //=> 'a{}'
 * ```
 */
declare class Rule_ extends Container.default {
  constructor(defaults?: Rule.RuleProps)
  type: 'rule'
  parent: Container | undefined
  raws: RuleRaws

  /**
   * The rule’s full selector represented as a string.
   *
   * ```js
   * const root = postcss.parse('a, b { }')
   * const rule = root.first
   * rule.selector //=> 'a, b'
   * ```
   */
  selector: string

  /**
   * An array containing the rule’s individual selectors.
   * Groups of selectors are split at commas.
   *
   * ```js
   * const root = postcss.parse('a, b { }')
   * const rule = root.first
   *
   * rule.selector  //=> 'a, b'
   * rule.selectors //=> ['a', 'b']
   *
   * rule.selectors = ['a', 'strong']
   * rule.selector //=> 'a, strong'
   * ```
   */
  selectors: string[]

  assign(overrides: object | Rule.RuleProps): this
  clone(overrides?: Partial<Rule.RuleProps>): this
  cloneBefore(overrides?: Partial<Rule.RuleProps>): this
  cloneAfter(overrides?: Partial<Rule.RuleProps>): this
}

declare class Rule extends Rule_ {}

export = Rule
