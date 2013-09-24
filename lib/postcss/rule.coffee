DeclarationsList = require('./declarations_list')

# CSS rule like “a { }”
class Rule
  DeclarationsList.include(@)

  constructor: ->
    @type = 'rule'
    @decls = []

module.exports = Rule
