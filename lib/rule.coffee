Container   = require('./container')
Declaration = require('./declaration')

# CSS rule like “a { }”
class Rule extends Container.WithDecls
  constructor: ->
    @type = 'rule'
    super

  @raw 'selector'

  # Stringify rule
  toString: ->
    (@before || '') + @_selector.stringify(after: ' ') + @stringifyContent()

module.exports = Rule
