'use strict'

let Container = require('./container')

class AtRule extends Container {
  constructor (defaults) {
    super(defaults)
    this.type = 'atrule'
  }

  append (...children) {
    if (!this.nodes) this.nodes = []
    return super.append(...children)
  }

  prepend (...children) {
    if (!this.nodes) this.nodes = []
    return super.prepend(...children)
  }
}

module.exports = AtRule

Container.registerAtRule(AtRule)
