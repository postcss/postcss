MapGenerator = require('./map-generator')

# Object with processed CSS
class Result
  constructor: (@root, @opts = { }) ->

  # Generate CSS and map
  stringify: ->
    map = new MapGenerator(@root, @opts)
    [@cssCached, @mapCached] = map.generate()

  # Return CSS string on any try to print
  toString: ->
    @css

# Lazy method to return source map
Object.defineProperty Result.prototype, 'map', get: ->
  @stringify() unless @cssCached
  @mapCached

# Lazy method to return CSS string
Object.defineProperty Result.prototype, 'css', get: ->
  @stringify() unless @cssCached
  @cssCached

module.exports = Result
