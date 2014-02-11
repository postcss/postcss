Node   = require('./node')
vendor = require('./vendor')

# CSS declaration like “color: black” in rules
class Declaration extends Node
  constructor: ->
    @type = 'decl'
    super

  defaultStyle: -> { between: ': ' }

  @raw 'value'

  # Some magic for !important
  @prop 'important',
    get: ->
      !!@_important
    set: (value) ->
      if typeof(value) == 'string' and value != ''
        @_important = value
      else if value
        @_important = ' !important'
      else
        @_important = false

  # Stringify declaration
  stringify: (builder, semicolon) ->
    builder(@before) if @before
    string  = @prop + @style().between + @_value.toString()
    string += @_important || ''
    string += ';' if semicolon
    builder(string, @)

  # Clean `before` property in clone to copy it from new parent rule
  clone: (obj) ->
    cloned = super
    delete cloned.before
    cloned

module.exports = Declaration
