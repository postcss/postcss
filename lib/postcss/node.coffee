Raw = require('./raw')

# Some common methods for all CSS nodes
class Node

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

module.exports = Node
