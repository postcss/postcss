import Container from './container';
import postcss from './postcss';
import PreviousMap from './previous-map';
import Node from './node';
import AtRule from './at-rule';
import Rule from './rule';
import Comment from './comment';
import Declaration from './declaration';
import Result from './result';
/**
 * Represents a CSS file and contains all its parsed nodes.
 */
export default class Root extends Container {
    'type': string;
    /**
     * The space symbols after the last child of root, such as \n at the end of a file.
     */
    after: string;
    prevMap: PreviousMap;
    styleCache: {
        [key: string]: any;
    };
    /**
     * @returns A clone of the node. The resulting cloned node and its (cloned)
     * children will have clean parent and code style properties.
     */
    clone(): Root;
    remove(child: any): Container;
    normalize(node: Node | string, sample: Node, nodeType?: string): Node[];
    normalize(props: AtRule.NewProps | Rule.NewProps | Declaration.NewProps | Comment.NewProps, sample: Node, nodeType?: string): Node[];
    stringify(builder: any): void;
    /**
     * @returns A Result instance representing the root's CSS.
     */
    toResult(options?: {
        /**
         * The path where you'll put the output CSS file. You should always set to
         * generate correct source maps.
         */
        to?: string;
        map?: postcss.SourceMapOptions;
    }): Result;
}
