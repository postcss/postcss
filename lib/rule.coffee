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
    builder((@before || '') + @_selector.stringify(after: ' ') + '{')
    @stringifyContent(builder)
    builder('}')

module.exports = Rule
