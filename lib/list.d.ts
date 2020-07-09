/**
 * Contains helpers for safely splitting lists of CSS values,
 * preserving parentheses and quotes.
 *
 * ```js
 * let list = postcss.list
 * ```
 */
export default interface list {
  /**
   * Safely splits space-separated values (such as those for `background`,
   * `border-radius`, and other shorthand properties).
   *
   * ```js
   * postcss.list.space('1px calc(10% + 1px)') //=> ['1px', 'calc(10% + 1px)']
   * ```
   *
   * @param str Space-separated values.
   * @return Split values.
   */
  space(str: string): string[]
  /**
   * Safely splits comma-separated values (such as those for `transition-*`
   * and `background` properties).
   *
   * ```js
   * postcss.list.comma('black, linear-gradient(white, black)')
   * //=> ['black', 'linear-gradient(white, black)']
   * ```
   *
   * @param str Comma-separated values.
   * @return Split values.
   */
  comma(str: string): string[]
}
