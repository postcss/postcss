'use strict'

let Container = require('./container')

let LazyResult, Processor

function hasExplicitBefore(node) {
  return (
    node &&
    typeof node === 'object' &&
    node.raws &&
    typeof node.raws.before !== 'undefined'
  )
}

function isNewCommentWithExplicitBefore(node) {
  return (
    node &&
    typeof node === 'object' &&
    !node.parent &&
    (node.type === 'comment' || node.text) &&
    hasExplicitBefore(node)
  )
}

function explicitBeforeValues(child) {
  if (!child || typeof child === 'string') return []
  if (Array.isArray(child) || child.type === 'root') return []
  return [isNewCommentWithExplicitBefore(child)]
}

class Root extends Container {
  constructor(defaults) {
    super(defaults)
    this.type = 'root'
    if (!this.nodes) this.nodes = []
  }

  normalize(child, sample, type) {
    let explicitBefore = explicitBeforeValues(child)
    let nodes = super.normalize(child)

    if (sample) {
      if (type === 'prepend') {
        if (this.nodes.length > 1) {
          sample.raws.before = this.nodes[1].raws.before
        } else {
          delete sample.raws.before
        }
      } else if (this.first !== sample) {
        for (let [index, node] of nodes.entries()) {
          if (explicitBefore[index]) continue
          node.raws.before = sample.raws.before
        }
      }
    }

    return nodes
  }

  removeChild(child, ignore) {
    let index = this.index(child)

    if (!ignore && index === 0 && this.nodes.length > 1) {
      this.nodes[1].raws.before = this.nodes[index].raws.before
    }

    return super.removeChild(child)
  }

  toResult(opts = {}) {
    let lazy = new LazyResult(new Processor(), this, opts)
    return lazy.stringify()
  }
}

Root.registerLazyResult = dependant => {
  LazyResult = dependant
}

Root.registerProcessor = dependant => {
  Processor = dependant
}

module.exports = Root
Root.default = Root

Container.registerRoot(Root)
