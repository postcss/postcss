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

  # Add child to end of list without any checks.
  # Please, use `append()` method, `push()` is mostly for parser.
  push: (child) ->
    list  = @rules || @decls
    list.push(child)
    this

  # Add child to container
  append: (child) ->
    list  = @rules || @decls
    if not child.before? and list.length > 0
      child.before = list[list.length - 1].before
    list.push(child)
    this

  # Add child to beginning of container
  prepend: (child) ->
    list = @rules || @decls
    if not child.before? and list.length > 0
      child.before = list[0].before
    list.unshift(child)
    this

  # Insert new `added` child before `exist`.
  # You can set node object or node index (it will be faster) in `exist`.
  insertBefore: (exist, added) ->
    list  = @rules || @decls
    exist = list.indexOf(exist) if typeof(exist) != 'number'
    if not added.before? and list.length > 0
      added.before = list[exist].before
    list.splice(exist, 0, added)
    this

  # Insert new `added` child after `exist`.
  # You can set node object or node index (it will be faster) in `exist`.
  insertAfter: (exist, added) ->
    list  = @rules || @decls
    exist = list.indexOf(exist) if typeof(exist) != 'number'
    if not added.before? and list.length > 0
      added.before = list[exist].before
    list.splice(exist + 1, 0, added)
    this

# Container with another rules, like @media at-rule
class Container.WithRules extends Container
  constructor: ->
    @rules = []
    super

# Container with another rules, like @media at-rule
class Container.WithDecls extends Container
  constructor: ->
    @decls = []
    super

module.exports = Container
