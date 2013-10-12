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
    @list.push(child)
    this

  # Add child to container
  append: (child) ->
    child = @normalize(child, @list[@list.length - 1])
    @list.push(child)
    this

  # Add child to beginning of container
  prepend: (child) ->
    child = @normalize(child, @list[0])
    @list.unshift(child)
    this

  # Insert new `added` child before `exist`.
  # You can set node object or node index (it will be faster) in `exist`.
  insertBefore: (exist, add) ->
    exist = @index(exist)
    add   = @normalize(add, @list[exist])
    @list.splice(exist, 0, add)
    this

  # Insert new `added` child after `exist`.
  # You can set node object or node index (it will be faster) in `exist`.
  insertAfter: (exist, add) ->
    exist = @index(exist)
    add   = @normalize(add, @list[exist])
    @list.splice(exist + 1, 0, add)
    this

  # Return index of child
  index: (child) ->
    if typeof(child) == 'number'
      child
    else
      @list.indexOf(child)

  # Shortcut to get current list
  @prop 'list', get: -> @rules || @decls

  # Normalize child before insert. Copy before from `sample`.
  normalize: (child, sample) ->
    if not child.before? and sample
      child.before = sample.before
    child

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
