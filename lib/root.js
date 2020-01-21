let Container = require('./container')

let LazyResult, Processor

/**
 * Represents a CSS file and contains all its parsed nodes.
 *
 * @extends Container
 *
 * @example
 * const root = postcss.parse('a{color:black} b{z-index:2}')
 * root.type         //=> 'root'
 * root.nodes.length //=> 2
 */
class Root extends Container {
  constructor (defaults) {
    super(defaults)
    this.type = 'root'
    this.listeners = { }
    if (!this.nodes) this.nodes = []
  }

  removeChild (child, ignore) {
    let index = this.index(child)

    if (!ignore && index === 0 && this.nodes.length > 1) {
      this.nodes[1].raws.before = this.nodes[index].raws.before
    }

    return super.removeChild(child)
  }

  normalize (child, sample, type) {
    let nodes = super.normalize(child)

    if (sample) {
      if (type === 'prepend') {
        if (this.nodes.length > 1) {
          sample.raws.before = this.nodes[1].raws.before
        } else {
          delete sample.raws.before
        }
      } else if (this.first !== sample) {
        for (let node of nodes) {
          node.raws.before = sample.raws.before
        }
      }
    }

    return nodes
  }

  /**
   * Returns a {@link Result} instance representing the root’s CSS.
   *
   * @param {processOptions} [opts] Options with only `to` and `map` keys.
   *
   * @return {Result} Result with current root’s CSS.
   *
   * @example
   * const root1 = postcss.parse(css1, { from: 'a.css' })
   * const root2 = postcss.parse(css2, { from: 'b.css' })
   * root1.append(root2)
   * const result = root1.toResult({ to: 'all.css', map: true })
   */
  toResult (opts = { }) {
    let lazy = new LazyResult(new Processor(), this, opts)
    return lazy.stringify()
  }

  /**
   * Add visitor for next PostCSS walk.
   *
   * Visitor subscribes for events. Each event contain node type (`atrule`,
   * `rule`, `decl`, `comment`) and phase (`enter`, `exit`) separated with dot.
   * The default phase is `enter`. As result possible events could be like
   * `comment.enter`, `decl.exit` or `rule` (equal to `rule.enter`).
   *
   * PostCSS will walk through CSS AST and call visitor according current node.
   * Visitor will receive node and node’s index.
   *
   * @param {visitingEvent} [type] The type of the node and phase.
   * @param {visitor} [visitor] Function receives node and index.
   *
   * @return {undefined}
   *
   * @example
   * css.on('decl', (node, index) => {
   *   if (node.prop === 'will-change') {
   *     node.cloneBefore({ prop: 'backface-visibility', value: 'hidden' })
   *   }
   * })
   */
  on (event, visitor) {
    if (!event.includes('.')) event += '.enter'
    if (!this.listeners[event]) this.listeners[event] = []
    this.listeners[event].push(visitor)
  }

  /**
   * @memberof Root#
   * @member {object} raws Information to generate byte-to-byte equal
   *                       node string as it was in the origin input.
   *
   * Every parser saves its own properties,
   * but the default CSS parser uses:
   *
   * * `after`: the space symbols after the last child to the end of file.
   * * `semicolon`: is the last child has an (optional) semicolon.
   *
   * @example
   * postcss.parse('a {}\n').raws //=> { after: '\n' }
   * postcss.parse('a {}').raws   //=> { after: '' }
   */
}

/**
 * @callback visitor
 * @param {Node} node    Container child.
 * @param {number} index Child index.
 */

/**
 * @typedef {
 *   "atrule", "rule", "decl", "comment",
 *   "atrule.enter", "rule.enter", "decl.enter", "comment.enter",
 *   "atrule.exit", "rule.exit", "decl.exit", "comment.exit",
 * } visitingEvent
 */

Root.registerLazyResult = dependant => {
  LazyResult = dependant
}

Root.registerProcessor = dependant => {
  Processor = dependant
}

module.exports = Root
