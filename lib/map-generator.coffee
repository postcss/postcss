base64js = require('base64-js')
mozilla  = require('source-map')
Result   = require('./result')
path     = require('path')

# All tools to generate source maps
class MapGenerator
  constructor: (@root, @opts) ->

  # Should map be generated
  isMap: ->
    return !!@opts.map if @opts.map?
    !!@opts.inlineMap || @previous().length > 0

  # Return source map arrays from previous compilation step (like Sass)
  previous: ->
    unless @previousMaps
      @previousMaps = []
      @root.eachInside (node) =>
        if node.source?.map?
          if @previousMaps.indexOf(node.source.map) == -1
            @previousMaps.push(node.source.map)
    @previousMaps

  # Should we inline source map to annotation comment
  isInline: ->
    return @opts.inlineMap if @opts.inlineMap?
    @previous().some (i) -> i.inline

  # Clear source map annotation comment
  clearAnnotation: ->
    last = @root.last
    return null unless last

    if last.type == 'comment' and last.text.match(/^# sourceMappingURL=/)
      last.removeSelf()

  # Apply source map from previous compilation step (like Sass)
  applyPrevMaps: ->
    return if @previous().length == 0

    for prev in @previous()
      from = @relative(prev.file)
      @map.applySourceMap(prev.object(), from, path.dirname(from))

  # Add source map annotation comment if it is needed
  addAnnotation: ->
    return if @opts.mapAnnotation == false
    return if @previous().length > 0 and @previous().every (i) -> !i.annotation

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
    @applyPrevMaps()
    @addAnnotation()

    if @isInline()
      new Result(@root, @css)
    else
      new Result(@root, @css, @map)

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
