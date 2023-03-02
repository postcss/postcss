import Result = require('./result.js')
import { SourceMap } from './postcss.js'
import Processor = require('./processor.js')
import Warning = require('./warning.js')
import Root = require('./root.js')
import LazyResult = require('./lazy-result.js')

/**
 * A Promise proxy for the result of PostCSS transformations.
 * This lazy result instance doesn't parse css unless `NoWorkResult#root` or `Result#root`
 * are accessed. See the example below for details.
 * A `NoWork` instance is returned by `Processor#process` ONLY when no plugins defined.
 *
 * ```js
 * const noWorkResult = postcss().process(css) // No plugins are defined.
 *                                             // CSS is not parsed
 * let root = noWorkResult.root // now css is parsed because we accessed the root
 * ```
 */
declare class NoWorkResult implements LazyResult {
  static default: typeof NoWorkResult

  then: Promise<Result>['then']
  catch: Promise<Result>['catch']
  finally: Promise<Result>['finally']
  constructor(processor: Processor, css: string, opts: Result.ResultOptions)
  get [Symbol.toStringTag](): string
  get processor(): Processor
  get opts(): Result.ResultOptions
  get css(): string
  get content(): string
  get map(): SourceMap
  get root(): Root
  get messages(): Result.Message[]
  warnings(): Warning[]
  toString(): string
  sync(): Result
  async(): Promise<Result>
}

export = NoWorkResult
