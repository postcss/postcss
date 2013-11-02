# Property with trimmed and raw value (with comments and spaces)
class Raw
  constructor: (@raw, @trimmed) ->

  # Set new trimmed value and mark property as changed
  set: (value) ->
    if @trimmed != value
      @changed = true
      @trimmed = value

  # Stringify to CSS raw value if trimmed wasn’t changed
  stringify: (opts = { }) ->
    if not @changed
      @raw || ''
    else if not @raw
      (opts.before || '') + @trimmed + (opts.after || '')
    else
      (if @raw[0] == ' ' then ' ' else '') +
      @trimmed +
      (if @raw[-1..-1] == ' ' then ' ' else '')

Raw.empty = new Raw()

module.exports = Raw
