Node   = require('./node')
vendor = require('./vendor')

# CSS declaration like “color: black” in rules
class Declaration extends Node
  constructor: ->
    @type = 'decl'
    super

  @raw 'value'

  # Stringify declaration
  stringify: (builder, semicolon) ->
    builder(@before) if @before
    string  = @prop + (@between || '') + ':' + @_value.stringify(before: ' ')
    string += ';' if semicolon
    builder(string, @)

  # Remove declaration from parent.
  #
  #   decl.removeSelf()
  #
  # Note, that removing by index is faster:
  #
  #   rule.each (decl, i) ->
  #     rule.remove(i)
  removeSelf: ->
    return unless @parent
    @parent.remove(@)
    this

  # Clean `before` property in clone to copy it from new parent rule
  clone: (obj) ->
    cloned = super
    delete cloned.before
    cloned

module.exports = Declaration
