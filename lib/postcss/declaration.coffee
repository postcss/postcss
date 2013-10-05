Node = require('./node')

# CSS declaration like “color: black” in rules
class Declaration extends Node
  constructor: ->
    @type = 'decl'

  @raw 'value'

module.exports = Declaration
