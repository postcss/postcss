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
    between  = if @between? then @between else ' '
    @stringifyBlock(builder, "#{ @_selector + between }{")

module.exports = Rule
