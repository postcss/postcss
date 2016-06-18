/**
 * Represents a plugin’s warning. It can be created using {@link Node#warn}.
 *
 * @example
 * if ( decl.important ) {
 *     decl.warn(result, 'Avoid !important', { word: '!important' });
 * }
 */
class Warning {

    /**
     * @param {string} text - warning message
     * @param {Object} opts - warning options
     * @param {Node}   opts.node   - CSS node that caused the warning
     * @param {string} opts.word   - word in CSS source that caused the warning
     * @param {number} opts.index  - index in CSS node string that caused
     *                               the warning
     * @param {string} opts.plugin - name of the plugin that created
     *                               this warning. Node#warn() fill
     *                               this property automatically.
     */
    constructor(text, opts = { }) {
        /**
         * @member {string} - type to filter warnings from
         *                    {@link Result#messages}. Always equal
         *                    to `"warning"`.
         */
        this.type = 'warning';
        /**
         * @member {string} - Contains the warning message.
         */
        this.text = text;

        if ( opts.node && opts.node.source ) {
            let pos     = opts.node.positionBy(opts);
            /**
             * @member {number} - line in the input file
             *                    with this warning’s source
             */
            this.line   = pos.line;
            /**
             * @member {number} - Column in the input file
             *                    with this warning’s source.
             */
            this.column = pos.column;
        }

        for ( let opt in opts ) this[opt] = opts[opt];
    }

    /**
     * Returns a string with the error position and message.
     *
     * @example
     * warning.toString() //=> 'postcss-lint:a.css:10:14: Avoid !important'
     *
     * @return {string}
     */
    toString() {
        if ( this.node ) {
            return this.node.error(this.text, {
                plugin: this.plugin,
                index:  this.index,
                word:   this.word
            }).message;
        } else if ( this.plugin ) {
            return this.plugin + ': ' + this.text;
        } else {
            return this.text;
        }
    }

    /**
     * @member {string} plugin - Contains the name of the plugin that created
     *                           it will fill this property automatically.
     *                           this warning. When you call {@link Node#warn}
     * @memberof Warning#
     */

     /**
      * @member {Node} node - Contains the CSS node that caused the warning.
      * @memberof Warning#
      */

}

export default Warning;
