Mixin = require('./mixin')

# Common methods to work with rules in stylesheet and at-rules with rules
class RulesList extends Mixin

  # Add Rule or AtRule statement
  push: (child) ->
    @rules.push(child)

module.exports = RulesList
