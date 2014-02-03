mozilla = require('source-map')
Result  = require('./result')
base64  = require('base64-js')

# All tools to generate source maps
class MapGenerator
  constructor: (@root, @opts) ->

  # Is `string` is starting with `start`
  startWith: (string, start) ->
    string[0..start.length-1] == start

  # Should map be generated
  isMap: ->
    !!@opts.map || !!@opts.inlineMap || @prevMap()

  # Should we inline source map to annotation comment
  isInline: ->
    return @opts.inlineMap if @opts.inlineMap?
    @isPrevInline()

  # Is source map from previous compilation step is inline to annotation comment
  isPrevInline: ->
    return false unless @prevAnnotation()

    text = @prevAnnotation().text
    @startWith(text, '# sourceMappingURL=data:')

  # Source map from previous compilation step (like Sass)
  prevMap: ->
    return @prevMapCache if @prevMapCache?

    if @opts.map and typeof(@opts.map) != 'boolean'
      return @prevMapCache = @opts.map

    if @isPrevInline()
      start = '# sourceMappingURL=data:application/json;base64,'
      text  = @prevAnnotation().text
      text  = text[start.length..-1]
      bytes = base64.toByteArray(text)

      @prevMapCache = (String.fromCharCode(byte) for byte in bytes).join('')
    else
      @prevMapCache = false

  # Lazy load for annotation comment from previous compilation step
  prevAnnotation: ->
    return @prevAnnotationCache if @prevAnnotationCache?

    last = @root.last
    return @prevAnnotationCache = null unless last

    if last.type == 'comment' and @startWith(last.text, '# sourceMappingURL=')
      @prevAnnotationCache = last
    else
      @prevAnnotationCache = null

  # Clear source map annotation comment
  clearAnnotation: ->
    @prevAnnotation()?.removeSelf()

  # Apply source map from previous compilation step (like Sass)
  applyPrevMap: ->
    if @prevMap()
      prev = new mozilla.SourceMapConsumer(@prevMap())
      @map.applySourceMap(prev)

  # Add source map annotation comment if it is needed
  addAnnotation: () ->
    return if @opts.mapAnnotation == false
    return if @prevMap() and not @prevAnnotation()

    content = if @isInline()
      bytes = (char.charCodeAt(0) for char in @map.toString())
      "data:application/json;base64," + base64.fromByteArray(bytes)
    else
      parts = @outputFile().split('/')
      file  = parts[parts.length - 1]
      file + '.map'

    @css += "\n/*# sourceMappingURL=#{ content } */"

  # Return output CSS file path
  outputFile: ->
    @opts.to || 'to.css'

  # Return Result object with map
  generateMap: ->
    @stringify()
    @applyPrevMap()
    @addAnnotation()

    if @isInline()
      new Result(@css)
    else
      new Result(@css, @map.toString())

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
          source:   node.source.file || 'from.css'
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
          source:   node.source.file || 'from.css'
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
      new Result(@root.toString())

module.exports = MapGenerator
