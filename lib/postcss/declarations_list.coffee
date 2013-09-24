Mixin = require('./mixin')

# Common methods to work with declarations in rules and at-rules
# with declarations
class DeclarationsList extends Mixin

  # Add declaration
  push: (decl) ->
    @decls.push(decl)

module.exports = DeclarationsList
