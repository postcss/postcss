# Object with processed CSS
class Result
  constructor: (@css, map) ->
    @map = map if map

  # Return CSS string on any try to print
  toString: ->
    @css

module.exports = Result
