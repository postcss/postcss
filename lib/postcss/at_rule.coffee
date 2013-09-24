RulesList        = require('./rules_list')
DeclarationsList = require('./declarations_list')

# CSS at-rule like “@keyframes name { }”.
#
# Can contain declarations (like @font-face or @page) ot another rules.
class AtRule
  constructor: ->
    @type    = 'atrule'
    @content = 'empty'

  # Is rule will contain declarations or another rules
  setContent: (type) ->
    @content = type
    if type == 'decls'
      @decls = []
      @__proto__ = AtRule.withDeclarations
    else if type == 'rules'
      @rules = []
      @__proto__ = AtRule.withRules

  # Change content type depend on object type and then call mixin’s method.
  push: (obj) ->
    @setContent(obj.type + 's')
    @push(obj)

AtRule.withRules        = RulesList.copy(AtRule)
AtRule.withDeclarations = DeclarationsList.copy(AtRule)

module.exports = AtRule
