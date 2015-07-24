import Node from './node';
declare class Comment extends Node implements Comment.NewProps {
    /**
     * Represents a comment between declarations or statements (rule and at-rules).
     * Comments inside selectors, at-rules parameters, or declaration values will be
     * stored in the raw properties.
     */
    constructor(defaults?: Comment.NewProps);
    'type': string;
    /**
     * The comment's text.
     */
    text: string;
    /**
     * The space symbols before the comment's text.
     */
    left: string;
    /**
     * The space symbols after the comment's text.
     */
    right: string;
    /**
     * The space symbols before the comment.
     */
    before: string;
    /**
     * @param overrides New properties with which to override the clone.
     * @returns A clone of the node. The resulting cloned node and its (cloned)
     * children will have clean parent and code style properties.
     */
    clone(overrides?: Comment.NewProps): Comment;
    stringify(builder: any): void;
}
declare module Comment {
    interface NewProps {
        /**
         * The comment's text.
         */
        text: string;
    }
}
export default Comment;
