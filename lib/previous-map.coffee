base64js = require('base64-js')
mozilla  = require('source-map')
path     = require('path')
fs       = require('fs')

class PreviousMap
  constructor: (root, opts) ->
    @file = opts.from

    @loadAnnotation(root)
    @inline = @startWith(@annotation, '# sourceMappingURL=data:') if @annotation

    text = @loadMap(opts)
    @map = text if text

  # Is `string` is starting with `start`
  startWith: (string, start) ->
    return false unless string
    string[0..start.length-1] == start

  # Load for annotation comment from previous compilation step
  loadAnnotation: (root) ->
    last = root.last
    return unless last

    if last.type == 'comment' and @startWith(last.text, '# sourceMappingURL=')
      @annotation = last.text

  # Encode different type of inline
  decodeInline: (text) ->
    uri    = '# sourceMappingURL=data:application/json,'
    base64 = '# sourceMappingURL=data:application/json;base64,'

    if @startWith(text, uri)
      decodeURIComponent( text[uri.length..-1] )

    else if @startWith(text, base64)
      text  = text[base64.length..-1]
      bytes = base64js.toByteArray(text)
      (String.fromCharCode(byte) for byte in bytes).join('')

    else
      throw new Error('Unknown source map encoding')

  # Load previous map
  loadMap: (opts) ->
    if opts.map and typeof(opts.map) != 'boolean'
      if typeof(opts.map) == 'string'
        opts.map
      else if opts.map instanceof mozilla.SourceMapConsumer
        mozilla.SourceMapGenerator.fromSourceMap(opts.map).toString()
      else if opts.map instanceof mozilla.SourceMapGenerator
        opts.map.toString()
      else
        JSON.stringify(opts.map)

    else if @inline
      @decodeInline(@annotation)

    else if @file
      if @annotation
        file = @annotation.replace('# sourceMappingURL=', '')
        map  = path.join(path.dirname(@file), file)
      else
        map  = @file + '.map'

      fs.readFileSync(map).toString() if fs.existsSync?(map)

module.exports = PreviousMap
