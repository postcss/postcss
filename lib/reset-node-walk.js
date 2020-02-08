let { isClean, isComplete } = require('./symbols')

module.exports = function resetNodeWalk (node = {}) {
  let root = node.root && node.root()

  if (root === undefined || root.isVisitorMode === false) {
    return
  }

  node[isClean] = false

  if (node[isComplete]) {
    node[isComplete] = false

    if (node.parent) {
      resetNodeWalk(node.parent)
    }
  }
}
