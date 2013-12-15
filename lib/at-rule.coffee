Container = require('./container')

# CSS at-rule like “@keyframes name { }”.
#
# Can contain declarations (like @font-face or @page) ot another rules.
class AtRule extends Container
  constructor: ->
    @type = 'atrule'
    super

  # Load into at-rule mixin for selected content type
  addMixin: (type) ->
    mixin = if type == 'rules' then Container.WithRules else Container.WithDecls
    return unless mixin

    for name, value of mixin.prototype
      continue if name == 'constructor'
      @[name] = value
    mixin.apply(@)

  @raw 'params'

  # Stringify at-rule
  stringify: (builder, last) ->
    if @rules or @decls
      params = @_params.stringify(before: ' ', after: ' ')
      @stringifyBlock(builder, '@' + @name + params + '{')
    else
      builder(@before) if @before
      semicolon = if not last or @semicolon then ';' else ''
      builder('@' + @name + @_params.stringify(before: ' ') + semicolon, @)

# Detect container type by child type
for name in ['append', 'prepend']
  do (name) ->
    AtRule.prototype[name] = (child) ->
      @addMixin(child.type + 's')
      @[name](child)

module.exports = AtRule
