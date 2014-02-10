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
    name   = '@' + @name + if @afterName? then @afterName else ' '
    params = if @_params then @_params.toString() else ''

    if @rules or @decls
      params += if @afterParams?
        @afterParams
      else if params
        ' '
      else
        ''

      @stringifyBlock(builder, name + params + '{')

    else
      builder(@before) if @before
      params   += if @afterParams? then @afterParams else ''
      semicolon = if not last or @semicolon then ';' else ''
      builder(name + params + semicolon, @)

# Detect container type by child type
for name in ['append', 'prepend']
  do (name) ->
    AtRule.prototype[name] = (child) ->
      mixin = if child.type == 'decl' then 'decls' else 'rules'
      @addMixin(mixin)
      @[name](child)

module.exports = AtRule
