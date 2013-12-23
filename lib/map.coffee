sourceMap = require('source-map')
Comment   = require('./comment')
Result    = require('./result')
Raw       = require('./raw')

# Functions to create source map
map =
  # Clean CSS from any source map annotation comments
  clean: (css) ->
    css.eachComment (comment, i) ->
      annotation = '# sourceMappingURL='
      if comment.text[0..annotation.length-1] == annotation
        comment.parent.remove(i)

  # Add source map annotation cpmment to CSS
  annotation: (css, path) ->
    file       = path.match(/[^\/]+$/)[0]
    annotation = "# sourceMappingURL=#{ file }.map"
    annotation = new Raw(annotation + ' ', annotation)
    comment    = new Comment(text: annotation, before: "\n")

    css.append(comment)

  # Return CSS string and source map
  stringify: (root, path) ->
    css    = ''
    map    = new sourceMap.SourceMapGenerator(file: path)
    line   = 1
    column = 1

    builder = (str, node, type) ->
      css += str

      if node?.source?.start and type != 'end'
        map.addMapping
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
        map.addMapping
          source:   node.source.file || 'from.css'
          original:
            line:   node.source.end.line
            column: node.source.end.column
          generated:
            line:   line
            column: column

    root.stringify(builder)
    [css, map]

  # Stringify CSS with source map
  generate: (css, opts) ->
    to = opts.to || 'to.css'

    if opts.mapAnnotation != false
      @clean(css)
      @annotation(css, to)

    [str, map] = @stringify(css, to)
    result     = new Result(css, str)

    if typeof(opts.map) == 'string'
      prev = new sourceMap.SourceMapConsumer(opts.map)
      map.applySourceMap(prev)

    result.map = map.toString()
    result

module.exports = map
