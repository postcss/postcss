# Syntax sugar to define method, that cache it calculation in first call
#
#   class Calculator
#     lazy @, 'calc', ->
#       # Some big calculations
lazy = (klass, name, callback) ->
  cache = name + 'Cache'

  klass.prototype[name] = ->
    if @[cache]?
      @[cache]
    else
      @[cache] = callback.apply(@, arguments)

module.exports = lazy
