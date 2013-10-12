# Deeply clone arrays and objects
clone = (obj) ->
  if obj instanceof Array
    obj.map (i) -> clone(i)
  else if typeof(obj) == 'object'
    copy = new obj.constructor()
    for own name, value of obj
      copy[name] = clone(value)
    copy
  else
    obj

module.exports = clone
