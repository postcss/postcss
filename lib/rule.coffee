Container   = require('./container')
Declaration = require('./declaration')
list        = require('./list')

# CSS rule like “a { }”
class Rule extends Container.WithDecls
  constructor: ->
    @type = 'rule'
    super

  # Different style for empty and non-empty rules
  styleType: ->
    @type + if @decls.length
      '-body'
    else
      '-empty'

  defaultStyle: (type) ->
    if type == 'rule-body'
      { between: ' ', after: @defaultAfter() }
    else
      { between: ' ', after: '' }

  @raw 'selector'

  # Shortcut to get selectors as array
  @prop 'selectors',
    get: ->
      list.comma(@selector)
    set: (values) ->
      @selector = values.join(', ')

  # Stringify rule
  stringify: (builder) ->
    @stringifyBlock(builder, @_selector + @style().between + '{')

module.exports = Rule
