Node        = require('./node')
Declaration = require('./declaration')

# CSS node, that contain another nodes (like at-rules or rules with selectors)
class Container extends Node
  # Return container block with childs inside
  stringifyContent: (brackets = true) ->
    return if not @rules and not @decls

    inside = if @rules
      @rules.map( (rule, i) => rule.toString(@rules.length - 1 == i) ).join('')
    else if @decls
      @decls.map( (i) -> i.toString() ).join(';') + if @semicolon then ';' else ''

    inside += @after if @after?

    if brackets
      '{' + inside + '}'
    else
      inside

  # Add child to end of list without any checks.
  # Please, use `append()` method, `push()` is mostly for parser.
  push: (child) ->
    @list.push(child)
    this

  # Execute `callback` on every child element. First arguments will be child
  # node, second will be index.
  #
  #   css.each (rule, i) ->
  #     console.log(rule.type + ' at ' + i)
  #
  # It is safe for add and remove elements to list while iterating:
  #
  #  css.each (rule) ->
  #    css.insertBefore( rule, addPrefix(rule) )
  #    # On next iteration will be next rule, regardless of that list size
  #    # was increased
  each: (callback) ->
    @lastEach ||= 0
    @indexes  ||= { }

    @lastEach += 1
    id = @lastEach
    @indexes[id] = 0

    list = @list
    while @indexes[id] < list.length

      index = @indexes[id]
      callback(list[index], index)

      @indexes[id] += 1

    delete @indexes[id]
    this

  # Execute callback on every declaration in all rules inside.
  # It will goes inside at-rules recursivelly.
  #
  # First argument will be declaration node, second will be parent rule and
  # third will be index inside parent rule.
  #
  #   css.eachDecl (decl, rule, i) ->
  #     console.log('Decl ' + decl.prop + ' in ' + rule.selector + ' at ' + i)
  #
  # Also as `each` it is safe of insert/remove nodes inside iterating.
  eachDecl: (callback) ->
    # Different realization will be inside subclasses

  # Add child to container.
  #
  #   css.append(rule)
  #
  # You can add declaration by hash:
  #
  #   rule.append(prop: 'color', value: 'black')
  append: (child) ->
    child = @normalize(child, @list[@list.length - 1])
    @list.push(child)
    this

  # Add child to beginning of container
  #
  #   css.prepend(rule)
  #
  # You can add declaration by hash:
  #
  #   rule.prepend(prop: 'color', value: 'black')
  prepend: (child) ->
    child = @normalize(child, @list[0])
    @list.unshift(child)

    for id, index of @indexes
      @indexes[id] = index + 1

    this

  # Insert new `added` child before `exist`.
  # You can set node object or node index (it will be faster) in `exist`.
  #
  #   css.insertAfter(1, rule)
  #
  # You can add declaration by hash:
  #
  #   rule.insertBefore(1, prop: 'color', value: 'black')
  insertBefore: (exist, add) ->
    exist = @index(exist)
    add   = @normalize(add, @list[exist])
    @list.splice(exist, 0, add)

    for id, index of @indexes
      @indexes[id] = index + 1 if index >= exist

    this

  # Insert new `added` child after `exist`.
  # You can set node object or node index (it will be faster) in `exist`.
  #
  #   css.insertAfter(1, rule)
  #
  # You can add declaration by hash:
  #
  #   rule.insertAfter(1, prop: 'color', value: 'black')
  insertAfter: (exist, add) ->
    exist = @index(exist)
    add   = @normalize(add, @list[exist])
    @list.splice(exist + 1, 0, add)

    for id, index of @indexes
      @indexes[id] = index + 1 if index > exist

    this

  # Remove `child` by index or node.
  #
  #   css.remove(2)
  remove: (child) ->
    child = @index(child)
    @list.splice(child, 1)

    for id, index of @indexes
      @indexes[id] = index - 1 if index >= child

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

  # Execute callback on every declaration in all rules inside.
  # It will goes inside at-rules recursivelly.
  #
  # See documentation in `Container#eachDecl`.
  eachDecl: (callback) ->
    @each (child) -> child.eachDecl(callback)
    this

# Container with another rules, like @media at-rule
class Container.WithDecls extends Container
  constructor: ->
    @decls = []
    super

  # Allow to define new declaration as hash
  normalize: (child, sample) ->
    child = new Declaration(child) unless child.type
    super(child, sample)

  # Execute callback on every declaration.
  #
  # See documentation in `Container#eachDecl`.
  eachDecl: (callback) ->
    @each (decl, i) => callback(decl, this, i)
    this

module.exports = Container
