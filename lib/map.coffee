sourceMap = require('source-map')
Comment   = require('./comment')
Result    = require('./result')
Raw       = require('./raw')

# Functions to create source map
map =
  # Return true if comment is source map annotation
  isAnnotation: (comment) ->
    annotation = '# sourceMappingURL='
    comment.text[0..annotation.length-1] == annotation

  # Clean CSS from any source map annotation comments
  clean: (css) ->
    prev = false
    css.eachComment (comment, i) =>
      if @isAnnotation(comment)
        comment.parent.remove(i)
        prev = true
    prev

  # Add source map annotation cpmment to CSS
  annotation: (css, path) ->
    file       = path.match(/[^\/]+$/)[0]
    annotation = "# sourceMappingURL=#{ file }.map"
    comment    = new Comment(text: annotation, left: '', before: "\n")

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
    to      = opts.to || 'to.css'
    prevMap = typeof(opts.map) != 'boolean'

    prevAnnotation = @clean(css)
    addAnnotation  = if opts.mapAnnotation?
      opts.mapAnnotation
    else if prevMap and not prevAnnotation
      false
    else
      true
    @annotation(css, to) if addAnnotation

    [str, map] = @stringify(css, to)
    result     = new Result(css, str)

    if prevMap
      prev = new sourceMap.SourceMapConsumer(opts.map)
      map.applySourceMap(prev)

    result.map = map.toString()
    result

module.exports = map
