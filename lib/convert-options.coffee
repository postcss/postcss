mozilla = require('source-map')

deprected = (from, to) ->
  console.warn(
    "Option #{ from } is deprected and will be deleted in PostCSS 1.1.\n" +
    "Use map: { #{ to } } instead.")

module.exports = (old) ->
  opts = { }
  map  = { }

  for name, value of old

    if name == 'map'
      if value == 'inline'
        map.inline = true
      else if typeof(value) == 'string'
        deprected('map: prevMap', 'prev: prevMap')
        map.prev = value
      else if value instanceof mozilla.SourceMapConsumer
        deprected('map: prevMap', 'prev: prevMap')
        map.prev = value
      else if value instanceof mozilla.SourceMapGenerator
        deprected('map: prevMap', 'prev: prevMap')
        map.prev = value
      else if typeof(value) == 'object' and value.mappings?
        deprected('map: prevMap', 'prev: prevMap')
        map.prev = value
      else if typeof(value) == 'object' or typeof(value) == 'boolean'
        opts.map = value
      else
        deprected('map: prevMap', 'prev: prevMap')
        map.prev = value

    else if name == 'mapAnnotation'
      deprected("mapAnnotation", "annotation: #{value}")
      map.annotation = value

    else if name == 'inlineMap'
      deprected("inlineMap", "inline: #{value}")
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
