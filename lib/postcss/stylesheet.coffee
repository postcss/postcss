RulesList = require('./rules_list')

# Root of CSS
class Stylesheet
  RulesList.include(@)

  constructor: ->
    @rules = []

  # Stringify styles
  toString: ->
    #TODO
    ''

module.exports = Stylesheet
