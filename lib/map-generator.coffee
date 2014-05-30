base64js = require('base64-js')
mozilla  = require('source-map')

Result = require('./result')
lazy   = require('./lazy')
path   = require('path')
fs     = require('fs')

# All tools to generate source maps
class MapGenerator
  constructor: (@root, @opts) ->

  # Is `string` is starting with `start`
  startWith: (string, start) ->
    string[0..start.length-1] == start

  # Should map be generated
  isMap: ->
    return @opts.map if typeof(@opts.map) == 'boolean'
    !!@opts.inlineMap || !!@prevMap()

  # Should we inline source map to annotation comment
  lazy @, 'isInline', ->
    return @opts.inlineMap if @opts.inlineMap?
    @isPrevInline()

  # Is source map from previous compilation step is inline to annotation comment
  lazy @, 'isPrevInline', ->
    return false unless @prevAnnotation()

    text = @prevAnnotation().text
    @startWith(text, '# sourceMappingURL=data:')

  # Source map from previous compilation step (like Sass)
  lazy @, 'prevMap', ->
    return @opts.map if @opts.map and typeof(@opts.map) != 'boolean'

    if @isPrevInline()
      @encodeInline(@prevAnnotation().text)
    else if @opts.from
      map = @opts.from + '.map'
      if @prevAnnotation()
        file = @prevAnnotation().text.replace('# sourceMappingURL=', '')
        map  = path.join(path.dirname(@opts.from), file)

      if fs.existsSync?(map)
        fs.readFileSync(map).toString()
      else
        false

  # Lazy load for annotation comment from previous compilation step
  lazy @, 'prevAnnotation', ->
    last = @root.last
    return null unless last

    if last.type == 'comment' and @startWith(last.text, '# sourceMappingURL=')
      last
    else
      null

  # Encode different type of inline
  encodeInline: (text) ->
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

  # Clear source map annotation comment
  clearAnnotation: ->
    @prevAnnotation()?.removeSelf()

  # Apply source map from previous compilation step (like Sass)
  applyPrevMap: ->
    if @prevMap()
      prev = @prevMap()

      prev = if typeof(prev) == 'string'
        JSON.parse(prev)
      else if prev instanceof mozilla.SourceMapConsumer
        mozilla.SourceMapGenerator.fromSourceMap(prev).toJSON()
      else if typeof(prev) == 'object' and prev.toJSON
        prev.toJSON()
      else
        prev

      prev = new mozilla.SourceMapConsumer(prev)
      from = @relative(@opts.from)
      @map.applySourceMap(prev, from, path.dirname(from))

  # Add source map annotation comment if it is needed
  addAnnotation: ->
    return if @opts.mapAnnotation == false
    return if @prevMap() and not @prevAnnotation()

    content = if @isInline()
      bytes = (char.charCodeAt(0) for char in @map.toString())
      "data:application/json;base64," + base64js.fromByteArray(bytes)
    else
      @outputFile() + '.map'

    @css += "\n/*# sourceMappingURL=#{ content } */"

  # Return output CSS file path
  outputFile: ->
    if @opts.to then path.basename(@opts.to) else 'to.css'

  # Return Result object with map
  generateMap: ->
    @stringify()
    @applyPrevMap()
    @addAnnotation()

    if @isInline()
      new Result(@root, @css)
    else
      new Result(@root, @css, @map.toString())

  # Return path relative from output CSS file
  relative: (file) ->
    from = if @opts.to then path.dirname(@opts.to) else '.'
    file = path.relative(from, file)
    file = file.replace('\\', '/') if path.sep == '\\'
    file

  # Return path of node source for map
  sourcePath: (node) ->
    @relative(node.source.file || 'from.css')

  # Return CSS string and source map
  stringify: () ->
    @css   = ''
    @map   = new mozilla.SourceMapGenerator(file: @outputFile())
    line   = 1
    column = 1

    builder = (str, node, type) =>
      @css += str

      if node?.source?.start and type != 'end'
        @map.addMapping
          source:   @sourcePath(node)
          original:
            line:   node.source.start.line
            column: node.source.start.column - 1
          generated:
            line:   line
            column: column - 1

      lines  = str.match(/\n/g)
      if lines
        line  += lines.length
        last   = str.lastIndexOf("\n")
        column = str.length - last
      else
        column = column + str.length

      if node?.source?.end and type != 'start'
        @map.addMapping
          source:   @sourcePath(node)
          original:
            line:   node.source.end.line
            column: node.source.end.column
          generated:
            line:   line
            column: column

    @root.stringify(builder)

  # Return Result object with or without map
  getResult: ->
    @clearAnnotation()

    if @isMap()
      @generateMap()
    else
      new Result(@root)

module.exports = MapGenerator
