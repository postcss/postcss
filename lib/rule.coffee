Container   = require('./container')
Declaration = require('./declaration')

# CSS rule like “a { }”
class Rule extends Container.WithDecls
  constructor: ->
    @type = 'rule'
    super

  @raw 'selector'

  # Stringify rule
  stringify: (builder) ->
    selector = @_selector.stringify()
    between  = if @between? then @between else ' '
    @stringifyBlock(builder, selector + between + '{')

module.exports = Rule
