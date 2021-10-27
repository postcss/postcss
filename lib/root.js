'use strict'

let Container = require('./container')

let LazyResult, NoWork, Processor

class Root extends Container {
  constructor(defaults) {
    super(defaults)
    this.type = 'root'
    if (!this.nodes) this.nodes = []
  }

  removeChild(child, ignore) {
    let index = this.index(child)

    if (!ignore && index === 0 && this.nodes.length > 1) {
      this.nodes[1].raws.before = this.nodes[index].raws.before
    }

    return super.removeChild(child)
  }

  normalize(child, sample, type) {
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

  toResult(opts = {}) {
    let result

    if (
      typeof opts.plugins === 'undefined' &&
      typeof opts.parser === 'undefined' &&
      typeof opts.stringifier === 'undefined' &&
      typeof opts.syntax === 'undefined' &&
      !opts.hideNothingWarning
    ) {
      result = new NoWork(new Processor(), this, opts)
    } else {
      result = new LazyResult(new Processor(), this, opts)
    }

    return result.stringify()
  }
}

Root.registerLazyResult = dependant => {
  LazyResult = dependant
}

Root.registerNoWork = dependant => {
  NoWork = dependant
}

Root.registerProcessor = dependant => {
  Processor = dependant
}

module.exports = Root
Root.default = Root
