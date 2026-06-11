'use strict'

let Container = require('./container')

let LazyResult, Processor
let preserveBefore = Symbol('preserveBefore')

function hasExplicitWhitespaceBefore(node) {
  return (
    node &&
    typeof node === 'object' &&
    node.raws &&
    typeof node.raws.before !== 'undefined' &&
    /^\s*$/.test(node.raws.before)
  )
}

function isNewNodeWithExplicitBefore(node) {
  return (
    node &&
    typeof node === 'object' &&
    !node.parent &&
    hasExplicitWhitespaceBefore(node)
  )
}

function markNewNodesWithExplicitBefore(child) {
  if (!child || typeof child === 'string') return
  if (Array.isArray(child)) {
    for (let node of child) markNewNodesWithExplicitBefore(node)
    return
  }
  if (child.type === 'root') return
  if (isNewNodeWithExplicitBefore(child)) child[preserveBefore] = true
}

function shouldPreserveExplicitBefore(node) {
  let preserve = node[preserveBefore]
  delete node[preserveBefore]
  return preserve
}

class Root extends Container {
  constructor(defaults) {
    super(defaults)
    this.type = 'root'
    if (!this.nodes) this.nodes = []
  }

  normalize(child, sample, type) {
    if (sample && type !== 'prepend' && this.first !== sample) {
      markNewNodesWithExplicitBefore(child)
    }

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
          if (shouldPreserveExplicitBefore(node)) continue
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
