# Property with trimmed and raw value (with comments and spaces)
class Raw
  # Return Raw only if it necessary
  @load: (value, raw) ->
    if raw? and value != raw
      new Raw(value, raw)
    else
      value

  constructor: (@value, @raw) ->

  # Set new trimmed value and mark property as changed
  set: (value) ->
    if @value != value
      @raw     = @value
      @changed = true
      @value   = value

  # Stringify to CSS raw value if trimmed wasn’t changed
  toString: ->
    if @changed
      @value || ''
    else
      @raw || @value || ''

module.exports = Raw
