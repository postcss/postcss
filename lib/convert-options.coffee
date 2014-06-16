mozilla = require('source-map')

module.exports = (old) ->
  opts = { }
  map  = { }

  for name, value of old

    if name == 'map'
      if value == 'inline'
        map.inline = true
      else if typeof(value) == 'string'
        map.prev = value
      else if value instanceof mozilla.SourceMapConsumer
        map.prev = value
      else if value instanceof mozilla.SourceMapGenerator
        map.prev = value
      else if typeof(value) == 'object' and value.mappings?
        map.prev = value
      else if typeof(value) == 'object' or typeof(value) == 'boolean'
        opts.map = value
      else
        map.prev = value

    else if name == 'mapAnnotation'
      map.annotation = value

    else if name == 'inlineMap'
      map.inline = value

    else
      opts[name] = value

  if Object.keys(map).length > 0
    if typeof(opts.map) == 'object'
      for name, value of map
        opts.map[name] ||= value
    else
      opts.map = map

  opts
