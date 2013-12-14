# Object with compiled CSS
class Result
  constructor: (@root) ->
    @css = @root.toString()

  # Return CSS string on any try to print
  toString: ->
    @css

module.exports = Result
