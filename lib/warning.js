'use strict'

class Warning {
  constructor(text, opts = {}) {
    this.type = 'warning'
    this.text = text

    if (opts.node && opts.node.source) {
      if (
        opts.word ||
        typeof opts.endLine === 'number' ||
        typeof opts.endIndex === 'number' ||
        opts.inferRange
      ) {
        let range = opts.node.rangeBy(opts)
        this.line = range.start.line
        this.column = range.start.column

        if (
          range.start.line !== range.end.line ||
          range.start.column !== range.end.column
        ) {
          this.endLine = range.end.line
          this.endColumn = range.end.column
        }
      } else {
        let pos = opts.node.positionBy(opts)
        this.line = pos.line
        this.column = pos.column
      }
    }

    for (let opt in opts) this[opt] = opts[opt]
  }

  toString() {
    if (this.node) {
      return this.node.error(this.text, {
        plugin: this.plugin,
        index: this.index,
        word: this.word
      }).message
    }

    if (this.plugin) {
      return this.plugin + ': ' + this.text
    }

    return this.text
  }
}

module.exports = Warning
Warning.default = Warning
