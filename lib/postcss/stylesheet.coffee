Container = require('./container')

# Root of CSS
class Stylesheet extends Container.WithRules
  constructor: ->
    @rules = []
    super

  # Stringify styles
  toString: ->
    @stringifyContent(false)

module.exports = Stylesheet
