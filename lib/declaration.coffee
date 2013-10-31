Node   = require('./node')
vendor = require('./vendor')

# CSS declaration like “color: black” in rules
class Declaration extends Node
  constructor: ->
    @type = 'decl'
    super

  @raw 'value'

  @prop 'unprefixed', get: ->
    @unprefixedCache ||= vendor.split(@prop).name

  # Stringify declaration
  toString: ->
    (@before || '') + @prop + (@between || '') + ':' + @_value.stringify(true)

  # Clean `before` property in clone to copy it from new parent rule
  clone: (obj) ->
    cloned = super
    delete cloned.before
    cloned

module.exports = Declaration
