Container = require('./container')

# CSS at-rule like “@keyframes name { }”.
#
# Can contain declarations (like @font-face or @page) ot another rules.
class AtRule extends Container
  constructor: ->
    @type = 'atrule'
    super

  # Different style for @encoding and @page at-rules.
  styleType: ->
    if @rules? or @decls?
      'body'
    else
      'bodiless'

  defaultStyle: (type) ->
    if type == 'body'
      { between: ' ' }
    else
      { between: '' }

  # Load into at-rule mixin for selected content type
  addMixin: (type) ->
    mixin = if type == 'rules' then Container.WithRules else Container.WithDecls
    return unless mixin

    for name, value of mixin.prototype
      continue if name == 'constructor'

      container = Container.prototype[name] == value
      detector  = name == 'append' or name == 'prepend'
      continue if container and not detector

      @[name] = value
    mixin.apply(@)

  @raw 'params'

  # Stringify at-rule
  stringify: (builder, last) ->
    style = @style()

    name   = '@' + @name
    params = if @_params then @_params.toString() else ''

    name += if @afterName?
      @afterName
    else if params
      ' '
    else
      ''

    if @rules? or @decls?
      @stringifyBlock(builder, name + params + style.between + '{')

    else
      builder(@before) if @before
      semicolon = if not last or @semicolon then ';' else ''
      builder(name + params + style.between + semicolon, @)

# Detect container type by child type
for name in ['append', 'prepend']
  do (name) ->
    AtRule.prototype[name] = (child) ->
      mixin = if child.type == 'decl' then 'decls' else 'rules'
      @addMixin(mixin)
      @[name](child)

module.exports = AtRule
