Node = require('./node')

# CSS declaration like “color: black” in rules
class Declaration extends Node
  constructor: ->
    @type = 'decl'
    super

  @raw 'value'

  # Stringify declaration
  toString: ->
    (@before || '') + @prop + (@between || '') + ':' + @_value.stringify(true)

module.exports = Declaration
