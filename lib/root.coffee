Declaration = require('./declaration')
Container   = require('./container')
Comment     = require('./comment')
AtRule      = require('./at-rule')
Rule        = require('./rule')

# Root of CSS
class Root extends Container.WithRules
  constructor: ->
    @type  = 'root'
    @rules = []
    super

  # Fix spaces on insert before first rule
  normalize: (child, sample, type) ->
    child = super
    if type == 'prepend'
      sample.before = if @rules.length > 1 then @rules[1].before else @after
    child

  # Stringify styles
  stringify: (builder) ->
    @stringifyContent(builder)
    builder(@after) if @after

module.exports = Root
