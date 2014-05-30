# Object with processed CSS
class Result
  constructor: (@root, @css, map) ->
    @css = @root.toString() unless @css?
    @map = map if map

  # Return CSS string on any try to print
  toString: ->
    @css

module.exports = Result
