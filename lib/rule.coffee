Container   = require('./container')
Declaration = require('./declaration')

# CSS rule like “a { }”
class Rule extends Container.WithDecls
  constructor: ->
    @type = 'rule'
    super

  defaultStyle: -> { between: ' ' }

  @raw 'selector'

  # Shortcut to get selectors as array
  @prop 'selectors',
    get: ->
      @selector.split(/\s*,\s*/)
    set: (values) ->
      @selector = values.join(', ')

  # Stringify rule
  stringify: (builder) ->
    @stringifyBlock(builder, "#{ @_selector + @style().between }{")

module.exports = Rule
