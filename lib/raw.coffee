# Property with raw value (with comments)
class Raw
  # Return Raw only if it necessary
  @load: (value, raw) ->
    if raw? and value != raw
      new Raw(value, raw)
    else
      value

  constructor: (@value, @raw) ->

  # Stringify to CSS raw value if trimmed wasn’t changed
  toString: ->
    if @changed
      @value || ''
    else
      @raw || @value || ''

module.exports = Raw
