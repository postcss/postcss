SourceMap = require('source-map')
Result    = require('./result')

# Stringify CSS with source map
generateMap = (css, opts) ->
  map = new SourceMap.SourceMapGenerator(file: opts.to || 'to.css')

  result = new Result(css, '')
  line   = 1
  column = 1

  builder = (str, node, type) ->
    result.css += str

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

  css.stringify(builder)
  console.log(map)

  result.map = map.toString()
  result

module.exports = generateMap
