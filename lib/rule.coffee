Container   = require('./container')
Declaration = require('./declaration')

# CSS rule like “a { }”
class Rule extends Container.WithDecls
  constructor: ->
    @type = 'rule'
    super

  @raw 'selector'

  # Shortcut to get selectors as array
  @prop 'selectors',
    get: ->
      @selector.split(/\s*,\s*/)
    set: (values) ->
      @selector = values.join(', ')

  # Stringify rule
  stringify: (builder) ->
    between  = if @between? then @between else ' '
    @stringifyBlock(builder, "#{ @_selector + between }{")

module.exports = Rule
