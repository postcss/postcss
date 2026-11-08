import Document from './document.js'
import LazyResult from './lazy-result.js'
import { SourceMap } from './postcss.js'
import Processor from './processor.js'
import Result, { Message, ResultOptions } from './result.js'
import Root from './root.js'
import Warning from './warning.js'

declare namespace NoWorkResult {
  export { NoWorkResult_ as default }
}

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
declare class NoWorkResult_<RootNode extends Document | Root = Root>
  implements LazyResult<RootNode>
{
  catch: Promise<Result<RootNode>>['catch']
  finally: Promise<Result<RootNode>>['finally']
  then: Promise<Result<RootNode>>['then']
  get content(): string
  get css(): string
  get map(): SourceMap
  get messages(): Message[]
  get opts(): ResultOptions
  get processor(): Processor
  get root(): RootNode
  get [Symbol.toStringTag](): string
  constructor(
    processor: Processor,
    css: { toString(): string } | LazyResult | Result | Document | Root | string,
    opts: ResultOptions
  )
  async(): Promise<Result<RootNode>>
  sync(): Result<RootNode>
  toString(): string
  warnings(): Warning[]
}

declare class NoWorkResult<
  RootNode extends Document | Root = Root
> extends NoWorkResult_<RootNode> {}

export = NoWorkResult
