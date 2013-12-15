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
    @stringifyBlock(builder, @_selector.stringify(after: ' ') + '{')

module.exports = Rule
