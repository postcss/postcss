Node        = require('./node')
Declaration = require('./declaration')

# CSS node, that contain another nodes (like at-rules or rules with selectors)
class Container extends Node
  # Return container block with childs inside
  stringifyContent: (builder) ->
    return if not @rules and not @decls

    if @rules
      last = @rules.length - 1
      @rules.map (rule, i) ->
        rule.stringify(builder, last == i)

    else if @decls
      last = @decls.length - 1
      @decls.map (decl, i) =>
        decl.stringify(builder)
        builder(';') if last != i or @semicolon

    builder(@after) if @after?

  # Add child to end of list without any checks.
  # Please, use `append()` method, `push()` is mostly for parser.
  push: (child) ->
    child.parent = this
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
  # First argument will be declaration node, second will be index inside
  # parent rule.
  #
  #   css.eachDecl (decl, i) ->
  #     console.log(decl.prop + ' in ' + decl.parent.selector + ' at ' + i)
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
    child = @normalize(child, @list[0], 'prepend')
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
    add   = @normalize(add, @list[exist], if exist == 0 then 'prepend')
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

  # Return true if all childs return true in `condition`.
  # Just shorcut for `list.every`.
  every: (condition) ->
    @list.every(condition)

  # Return true if one or more childs return true in `condition`.
  # Just shorcut for `list.some`.
  some: (condition) ->
    @list.some(condition)

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
    child.parent = this

    if not child.before? and sample
      child.before = sample.before

    child

# Container with another rules, like @media at-rule
class Container.WithRules extends Container
  constructor: ->
    @rules = []
    super

  # Execute `callback` on every declaration in all rules inside.
  # It will goes inside at-rules recursivelly.
  #
  # See documentation in `Container#eachDecl`.
  eachDecl: (callback) ->
    @each (child) -> child.eachDecl(callback)
    this

  # Execute `callback` on every rule in conatiner and inside child at-rules.
  #
  # First argument will be rule node, second will be index inside parent.
  #
  #   css.eachRule (rule, i) ->
  #     if parent.type == 'atrule'
  #       console.log(rule.selector + ' in ' + rule.parent.name + ' at ' + i)
  #     else
  #       console.log(rule.selector + ' at ' + i)
  eachRule: (callback) ->
    @each (child, i) =>
      if child.type == 'rule'
        callback(child, i)
      else if child.eachRule
        child.eachRule(callback)
    this

  # Execute `callback` on every at-rule in conatiner and inside at-rules.
  #
  # First argument will be at-rule node, second will be index inside parent.
  #
  #   css.eachAtRule (atrule, parent, i) ->
  #     if parent.type == 'atrule'
  #       console.log(atrule.name + ' in ' + atrule.parent.name + ' at ' + i)
  #     else
  #       console.log(atrule.name + ' at ' + i)
  eachAtRule: (callback) ->
    @each (child, i) =>
      if child.type == 'atrule'
        callback(child, i)
        child.eachAtRule(callback) if child.eachAtRule
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
    @each (decl, i) => callback(decl, i)
    this

module.exports = Container
