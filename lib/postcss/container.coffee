Node = require('./node')

# CSS node, that contain another nodes (like at-rules or rules with selectors)
class Container extends Node

  # Return container block with childs inside
  stringifyContent: (brackets = true) ->
    return if not @rules and not @decls

    inside = if @rules
      @rules.map( (rule, i) => rule.toString(@rules.length - 1 == i) ).join('')
    else if @decls
      @decls.map( (i) -> i.toString() ).join(';') + if @semicolon then ';' else ''

    if brackets
      '{' + inside + @after + '}'
    else
      inside + @after

  # Add child to container
  append: (rule) ->
    list = @rules || @decls
    list.push(rule)
    this

# Container with another rules, like @media at-rule
class Container.WithRules extends Container
  constructor: ->
    @rules = []

# Container with another rules, like @media at-rule
class Container.WithDecls extends Container
  constructor: ->
    @decls = []

module.exports = Container
