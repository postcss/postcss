# Ruby like mixins
class Mixin
  # Extend class prototype by mixin methods
  @include: (klass) ->
    for name, value of @prototype
      klass.prototype[name] = value

  # Return class prototype copy with mixin methods
  @copy: (klass) ->
    clone = {}
    for name, value of klass.prototype
      clone[name] = value
    for name, value of @prototype
      clone[name] = value
    clone

module.exports = Mixin
