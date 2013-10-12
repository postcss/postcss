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

  # Clean `before` property in clone to copy it from new parent rule
  clone: (obj) ->
    clone = super
    delete clone.before
    clone

module.exports = Declaration
