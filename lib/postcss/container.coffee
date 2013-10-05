Node = require('./node')

# CSS node, that contain another nodes (like at-rules or rules with selectors)
class Container extends Node

# Container with another rules, like @media at-rule
class Container.WithRules extends Container
  constructor: ->
    @rules = []

  # Add rule to container
  push: (rule) ->
    @rules.push(rule)

# Container with another rules, like @media at-rule
class Container.WithDecls extends Container
  constructor: ->
    @decls = []

  # Add declaration to container
  push: (decl) ->
    @decls.push(decl)

module.exports = Container
