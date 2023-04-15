import Container from './container.js'
import Node, { NodeProps } from './node.js'

declare namespace Comment {
  export interface CommentRaws extends Record<string, unknown> {
    /**
     * The space symbols before the node.
     */
    before?: string

    /**
     * The space symbols between `/*` and the comment’s text.
     */
    left?: string

    /**
     * The space symbols between the comment’s text.
     */
    right?: string
  }

  export interface CommentProps extends NodeProps {
    /** Content of the comment. */
    text: string
    /** Information used to generate byte-to-byte equal node string as it was in the origin input. */
    raws?: CommentRaws
  }

  // eslint-disable-next-line @typescript-eslint/no-use-before-define
  export { Comment_ as default }
}

/**
 * Represents a comment between declarations or statements (rule and at-rules).
 *
 * ```js
 * Once (root, { Comment }) {
 *   let note = new Comment({ text: 'Note: …' })
 *   root.append(note)
 * }
 * ```
 *
 * Comments inside selectors, at-rule parameters, or declaration values
 * will be stored in the `raws` properties explained above.
 */
declare class Comment_ extends Node {
  type: 'comment'
  parent: Container | undefined
  raws: Comment.CommentRaws

  /**
   * The comment's text.
   */
  text: string

  constructor(defaults?: Comment.CommentProps)
  assign(overrides: object | Comment.CommentProps): this
  clone(overrides?: Partial<Comment.CommentProps>): this
  cloneBefore(overrides?: Partial<Comment.CommentProps>): this
  cloneAfter(overrides?: Partial<Comment.CommentProps>): this
}

declare class Comment extends Comment_ {}

export = Comment
