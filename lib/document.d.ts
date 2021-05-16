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
export default class Document extends Container {
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

  /**
   * An array containing the container’s children.
   *
   * ```js
   * const root = postcss.parse('a { color: black }')
   * root.nodes.length           //=> 1
   * root.nodes[0].selector      //=> 'a'
   * root.nodes[0].nodes[0].prop //=> 'color'
   * ```
   */
  // @ts-expect-error
  nodes: Root[]

  /**
   * The container’s first child.
   *
   * ```js
   * rule.first === rules.nodes[0]
   * ```
   */
  // @ts-expect-error
  get first(): ChildNode | undefined

  /**
   * The container’s last child.
   *
   * ```js
   * rule.last === rule.nodes[rule.nodes.length - 1]
   * ```
   */
  // @ts-expect-error
  get last(): ChildNode | undefined

  /**
   * Iterates through the container’s immediate children,
   * calling `callback` for each child.
   *
   * Returning `false` in the callback will break iteration.
   *
   * This method only iterates through the container’s immediate children.
   * If you need to recursively iterate through all the container’s descendant
   * nodes, use `Container#walk`.
   *
   * Unlike the for `{}`-cycle or `Array#forEach` this iterator is safe
   * if you are mutating the array of child nodes during iteration.
   * PostCSS will adjust the current index to match the mutations.
   *
   * ```js
   * const root = postcss.parse('a { color: black; z-index: 1 }')
   * const rule = root.first
   *
   * for (const decl of rule.nodes) {
   *   decl.cloneBefore({ prop: '-webkit-' + decl.prop })
   *   // Cycle will be infinite, because cloneBefore moves the current node
   *   // to the next index
   * }
   *
   * rule.each(decl => {
   *   decl.cloneBefore({ prop: '-webkit-' + decl.prop })
   *   // Will be executed only for color and z-index
   * })
   * ```
   *
   * @param callback Iterator receives each node and index.
   * @return Returns `false` if iteration was broke.
   */
  // @ts-expect-error
  each(
    callback: (node: ChildNode, index: number) => false | void
  ): false | undefined

  /**
   * Inserts new nodes to the end of the container.
   *
   * ```js
   * const decl1 = new Declaration({ prop: 'color', value: 'black' })
   * const decl2 = new Declaration({ prop: 'background-color', value: 'white' })
   * rule.append(decl1, decl2)
   *
   * root.append({ name: 'charset', params: '"UTF-8"' })  // at-rule
   * root.append({ selector: 'a' })                       // rule
   * rule.append({ prop: 'color', value: 'black' })       // declaration
   * rule.append({ text: 'Comment' })                     // comment
   *
   * root.append('a {}')
   * root.first.append('color: black; z-index: 1')
   * ```
   *
   * @param nodes New nodes.
   * @return This node for methods chain.
   */
  append(...nodes: (ChildProps | ChildProps[])[]): this

  /**
   * Inserts new nodes to the start of the container.
   *
   * ```js
   * const decl1 = new Declaration({ prop: 'color', value: 'black' })
   * const decl2 = new Declaration({ prop: 'background-color', value: 'white' })
   * rule.prepend(decl1, decl2)
   *
   * root.append({ name: 'charset', params: '"UTF-8"' })  // at-rule
   * root.append({ selector: 'a' })                       // rule
   * rule.append({ prop: 'color', value: 'black' })       // declaration
   * rule.append({ text: 'Comment' })                     // comment
   *
   * root.append('a {}')
   * root.first.append('color: black; z-index: 1')
   * ```
   *
   * @param nodes New nodes.
   * @return This node for methods chain.
   */
  prepend(...nodes: (ChildProps | ChildProps[])[]): this

  /**
   * Add child to the end of the node.
   *
   * ```js
   * rule.push(new Declaration({ prop: 'color', value: 'black' }))
   * ```
   *
   * @param child New node.
   * @return This node for methods chain.
   */
  // @ts-expect-error
  push(child: ChildNode): this

  /**
   * Insert new node before old node within the container.
   *
   * ```js
   * rule.insertBefore(decl, decl.clone({ prop: '-webkit-' + decl.prop }))
   * ```
   *
   * @param oldNode Child or child’s index.
   * @param newNode New node.
   * @return This node for methods chain.
   */
  // @ts-expect-error
  insertBefore(
    oldNode: ChildNode | number,
    newNode: ChildNode | ChildProps | ChildNode[] | ChildProps[]
  ): this

  /**
   * Insert new node after old node within the container.
   *
   * @param oldNode Child or child’s index.
   * @param newNode New node.
   * @return This node for methods chain.
   */
  // @ts-expect-error
  insertAfter(
    oldNode: ChildNode | number,
    newNode: ChildNode | ChildProps | ChildNode[] | ChildProps[]
  ): this

  /**
   * Removes node from the container and cleans the parent properties
   * from the node and its children.
   *
   * ```js
   * rule.nodes.length  //=> 5
   * rule.removeChild(decl)
   * rule.nodes.length  //=> 4
   * decl.parent        //=> undefined
   * ```
   *
   * @param child Child or child’s index.
   * @return This node for methods chain.
   */
  // @ts-expect-error
  removeChild(child: ChildNode | number): this

  /**
   * Returns `true` if callback returns `true`
   * for all of the container’s children.
   *
   * ```js
   * const noPrefixes = rule.every(i => i.prop[0] !== '-')
   * ```
   *
   * @param condition Iterator returns true or false.
   * @return Is every child pass condition.
   */
  // @ts-expect-error
  every(
    condition: (node: ChildNode, index: number, nodes: ChildNode[]) => boolean
  ): boolean

  /**
   * Returns `true` if callback returns `true` for (at least) one
   * of the container’s children.
   *
   * ```js
   * const hasPrefix = rule.some(i => i.prop[0] === '-')
   * ```
   *
   * @param condition Iterator returns true or false.
   * @return Is some child pass condition.
   */
  // @ts-expect-error
  some(
    condition: (node: ChildNode, index: number, nodes: ChildNode[]) => boolean
  ): boolean

  /**
   * Returns a `child`’s index within the `Container#nodes` array.
   *
   * ```js
   * rule.index( rule.nodes[2] ) //=> 2
   * ```
   *
   * @param child Child of the current container.
   * @return Child index.
   */
  // @ts-expect-error
  index(child: ChildNode | number): number
}
