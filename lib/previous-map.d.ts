import { SourceMapConsumer } from 'source-map'

import { ProcessOptions } from './postcss.js'

/**
 * Source map information from input CSS.
 * For example, source map after Sass compiler.
 *
 * This class will automatically find source map in input CSS or in file system
 * near input file (according `from` option).
 *
 * ```js
 * const root = postcss.parse(css, { from: 'a.sass.css' })
 * root.input.map //=> PreviousMap
 * ```
 */
export default class PreviousMap {
  /**
   * Was source map inlined by data-uri to input CSS.
   */
  inline: boolean

  /**
   * `sourceMappingURL` content.
   */
  annotation?: string

  /**
   * Source map file content.
   */
  text?: string

  /**
   * The directory with source map file, if source map is in separated file.
   */
  root?: string

  /**
   * @param css  Input CSS source.
   * @param opts Process options.
   */
  constructor (css: string, opts?: ProcessOptions)

  /**
   * Create a instance of `SourceMapGenerator` class
   * from the `source-map` library to work with source map information.
   *
   * It is lazy method, so it will create object only on first call
   * and then it will use cache.
   *
   * @return Object with source map information.
   */
  consumer (): SourceMapConsumer

  /**
   * Does source map contains `sourcesContent` with input source text.
   *
   * @return Is `sourcesContent` present.
   */
  withContent (): boolean
}
