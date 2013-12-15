# Object with processed CSS
class Result
  constructor: (@parsed, @css) ->

  # Return CSS string on any try to print
  toString: ->
    @css

module.exports = Result
