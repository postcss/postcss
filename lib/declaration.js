let Node = require('./node')

class Declaration extends Node {
  constructor (defaults) {
    super(defaults)
    this.type = 'decl'
  }
}

module.exports = Declaration
