import Container, { ContainerProps } from './container.js'
import { ProcessOptions } from './postcss.js'
import Result from './result.js'
import Root, { RootProps } from './root.js'

export interface DocumentProps extends ContainerProps {
  nodes?: Root[]
}

type ChildNode = Root
type ChildProps = RootProps

/**
 * Represents a file and contains all its parsed nodes.
 *
 * ```js
 * const document = postcss.parse('<html><style>a{color:black}</style><style>b{z-index:2}</style>')
 * document.type         //=> 'document'
 * document.nodes.length //=> 2
 * ```
 */
export default class Document extends Container<Root> {
  type: 'document'
  parent: undefined

  constructor(defaults?: DocumentProps)

  /**
   * Returns a `Result` instance representing the document’s CSS roots.
   *
   * ```js
   * const root1 = postcss.parse(css1, { from: 'a.css' })
   * const root2 = postcss.parse(css2, { from: 'b.css' })
   * const document = postcss.document()
   * document.append(root1)
   * document.append(root2)
   * const result = document.toResult({ to: 'all.css', map: true })
   * ```
   *
   * @param opts Options.
   * @return Result with current document’s CSS.
   */
  toResult(options?: ProcessOptions): Result
}