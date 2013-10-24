Raw = require('./raw')

# Recursivly clone objects
clone = (obj, parent) ->
  return obj unless typeof(obj) == 'object'
  cloned = new obj.constructor()

  for own name, value of obj
    if name == 'parent' and typeof(value) == 'object'
      cloned[name] = parent if parent
    else if value instanceof Array
      cloned[name] = value.map (i) -> clone(i, cloned)
    else
      cloned[name] = clone(value, cloned)

  cloned

# Some common methods for all CSS nodes
class Node
  constructor: (defaults = { }) ->
    for name, value of defaults
      @[name] = value

  # Syntax sugar to create getter/setter
  @prop: (name, params) ->
    Object.defineProperty(@prototype, name, params)

  # Create property with trimmed and raw value (with comments and spaces)
  @raw: (name) ->
    hidden = '_' + name

    @prototype[hidden] = Raw.empty

    @prop name,
      get: ->
        @[hidden]?.trimmed
      set: (value) ->
        if value instanceof Raw
          @[hidden] = value
        else
          @[hidden] = new Raw() if @[hidden] == Raw.empty
          @[hidden].set(value)

  # Remove this node from parent.
  #
  #   decl.remove()
  #
  # Note, that removing by index is faster:
  #
  #   rule.each (decl, i) ->
  #     rule.remove(i)
  remove: ->
    return unless @parent
    @parent.remove(@)

  # Clone current node.
  #
  #   rule.append decl.clone()
  #
  # You can override properties while cloning:
  #
  #   rule.append decl.clone(value: '0')
  clone: (overrides = { }) ->
    cloned = clone(@)
    for name, value of overrides
      cloned[name] = value
    cloned

  # Remove `parent` node on cloning to fix circular structures
  toJSON: ->
    fixed = { }
    for own name, value of this
      continue if name == 'parent'

      fixed[name] = if value instanceof Array
        value.map (i) ->
          if typeof(i) == 'object' and i.toJSON then i.toJSON() else i
      else if typeof(value) == 'object' and value.toJSON
        value.toJSON()
      else
        value

    fixed

module.exports = Node
