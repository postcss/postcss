Container = require('./container')

# Root of CSS
class Stylesheet extends Container.WithRules
  constructor: ->
    @rules = []
    super

module.exports = Stylesheet
