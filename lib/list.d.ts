/**
 * Safely splits space-separated values (such as those for `background`,
 * `border-radius`, and other shorthand properties).
 *
 * ```js
 * let { list } = require('postcss')
 * list.space('1px calc(10% + 1px)') //=> ['1px', 'calc(10% + 1px)']
 * ```
 *
 * @param str Space-separated values.
 * @return Split values.
 */
declare function space (str: string): string[]

/**
 * Safely splits comma-separated values (such as those for `transition-*`
 * and `background` properties).
 *
 * ```js
 * let { list } = require('postcss')
 * list.comma('black, linear-gradient(white, black)')
 * //=> ['black', 'linear-gradient(white, black)']
 * ```
 *
 * @param str Comma-separated values.
 * @return Split values.
 */
declare function comma (str: string): string[]

export type List = {
  space: (str: string) => string[]
  comma: (str: string) => string[]
}

/**
 * Contains helpers for safely splitting lists of CSS values,
 * preserving parentheses and quotes.
 *
 * ```js
 * let list = postcss.list
 * ```
 */
declare const list: List

export default list
