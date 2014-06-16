convertOptions = require('./convert-options')
SyntaxError    = require('./syntax-error')
PreviousMap    = require('./previous-map')
Declaration    = require('./declaration')
Comment        = require('./comment')
AtRule         = require('./at-rule')
Root           = require('./root')
Rule           = require('./rule')
Raw            = require('./raw')

path = require('path')

# CSS parser
class Parser
  constructor: (source, @opts) ->
    @source = source.toString()

    @root    = new Root()
    @current = @root
    @parents = [@current]
    @type    = 'rules'
    @types   = [@type]

    @pos    = -1
    @line   = 1
    @lines  = []
    @column = 0
    @buffer = ''

  loop: ->
    while @pos < @source.length - 1
      @move()
      @nextLetter()
    @endFile()

  setMap: ->
    map = new PreviousMap(@root, @opts)
    if map.text
      @root.prevMap = map
      @root.eachInside (i) -> i.source.map = map

  nextLetter: ->
    @inString()   ||
    @inComment()  ||
    @isComment()  ||
    @isString()   ||

    @isWrong()    ||

    @inAtrule()   || @isAtrule()   ||
    @isBlockEnd() ||
    @inSelector() || @isSelector() ||
    @inProperty() || @isProperty() || @inValue()
    @unknown()

  # Parsers

  inString: ->
    if @quote
      if @escape
        @escape = false
      else if @letter == '\\'
        @escape = true
      else if @letter == @quote
        @quote = undefined
      @trimmed += @letter
      true

  isString: ->
    if @letter == '"' or @letter == "'"
      @quote    = @letter
      @quotePos = line: @line, column: @column
      @trimmed += @letter
      true

  inComment: ->
    if @inside('comment')
      if @next('*/')
        [text, left]   = @startSpaces(@prevBuffer())
        [text, right]  = @endSpaces(text)
        @current.text  = text
        @current.left  = left
        @current.right = right
        @move()
        @pop()
      true
    else if @inside('value-comment')
      if @next('*/')
        @popType()
        @move()
      true

  isComment: ->
    if @next('/*')
      if @inside('rules') or @inside('decls')
        @init new Comment()
        @addType('comment')
        @move()
        @buffer = ''
      else
        @commentPos = line: @line, column: @column
        @addType('value-comment')
        @move()
        true

  isWrong: ->
    if @letter == '{' and (@inside('decls') or @inside('value'))
      @error("Unexpected {")

    if @inside('prop') and (@letter == '}' or @letter == ';')
      @error('Missing property value')

  isAtrule: ->
    if @letter == '@' and @inside('rules')
      @init new AtRule()
      @current.name = ''
      @addType('atrule-name')
      true

  inAtrule: (close) ->
    if @inside('atrule-name')
      if @space()
        @checkAtruleName()
        @buffer  = @buffer[@current.name.length..-1]
        @trimmed = ''
        @setType('atrule-param')

      else if @letter == ';' or @letter == '{' or close
        @current.between = ''
        @checkAtruleName()
        @endAtruleParams()

      else
        @current.name += @letter
      true

    else if @inside('atrule-param')
      if @letter == ';' or @letter == '{' or close
        [raw, left]          = @startSpaces(@prevBuffer())
        [raw, right]         = @endSpaces(raw)
        @current.params      = @raw(@trimmed.trim(), raw)
        if @current.params
          @current.afterName = left
          @current.between   = right
        else
          @current.afterName = ''
          @current.between   = left + right
        @endAtruleParams()

      else
        @trimmed += @letter
      true

  inSelector: ->
    if @inside('selector')
      if @letter == '{'
        [raw, spaces]     = @endSpaces(@prevBuffer())
        @current.selector = @raw(@trimmed.trim(), raw)
        @current.between  = spaces
        @semicolon = false
        @buffer    = ''
        @setType('decls')
      else
        @trimmed += @letter
      true

  isSelector: ->
    if not @space() and @inside('rules')
      @init new Rule()
      if @letter == '{'
        @addType('decls')
        @current.selector = ''
        @current.between  = ''
        @semicolon = false
        @buffer    = ''
      else
        @addType('selector')
        @buffer  = @letter
        @trimmed = @letter
      true

  isBlockEnd: ->
    if @letter == '}'
      if @parents.length == 1
        @error('Unexpected }')
      else
        if @inside('value')
          @fixEnd -> @inValue('close')
        else
          @current.semicolon = true if @semicolon
          @current.after     = @prevBuffer()
        @pop()
      true

  inProperty: ->
    if @inside('prop')
      if @letter == ':'
        if @buffer[0] == '*' or @buffer[0] == '_'
          @current.before += @buffer[0]
          @trimmed = @trimmed[1..-1]
          @buffer  = @buffer[1..-1]

        @current.prop    = @trimmed.trim()
        @current.between = @prevBuffer()[@current.prop.length..-1]
        @buffer = ''

        @setType('value')
        @trimmed = ''
      else if @letter == '{'
        @error('Unexpected { in decls')
      else
        @trimmed += @letter
      true

  isProperty: ->
    if @inside('decls') and not @space() and @letter != ';'
      @init new Declaration()
      @addType('prop')
      @buffer    = @letter
      @trimmed   = @letter
      @semicolon = false
      true

  inValue: (close) ->
    if @inside('value')
      if @letter == '('
        @inBrackets = true
      else if @inBrackets and @letter == ')'
        @inBrackets = false

      if (@letter == ';' and not @inBrackets) or close
        @semicolon = true if @letter == ';'
        [raw, spaces] = @startSpaces(@prevBuffer())
        trim          = @trimmed.trim()

        if match = raw.match(/\s+!important\s*$/)
          @current._important = match[0]
          end  = -match[0].length - 1
          raw  = raw[0..end]
          trim = trim.replace(/\s+!important$/, '')

        @current.value    = @raw(trim, raw)
        @current.between += ':' + spaces
        @pop()
      else
        @trimmed += @letter

      true

  unknown: ->
    @error("Unexpected symbol #{ @letter }") unless @space

  endFile: ->
    if @inside('atrule-param') or @inside('atrule-name')
      @fixEnd -> @inAtrule('close')

    if @inside('comment')
      @error('Unclosed comment', @current.source.start)
    else if @parents.length > 1
      @error('Unclosed block', @current.source.start)
    else if @inside('value-comment')
      @error('Unclosed comment', @commentPos)
    else if @quote
      @error('Unclosed quote', @quotePos)
    else
      @root.after = @buffer

  # Helpers

  error: (message, position = { line: @line, column: @column }) ->
    throw new SyntaxError(message, @source, position, @opts.from)

  move: ->
    @pos    += 1
    @column += 1
    @letter  = @source[@pos]
    @buffer += @letter

    if @letter == "\n"
      @lines[@line] = @column - 1
      @line  += 1
      @column = 0

  prevBuffer: ->
    @buffer[0..-2]

  inside: (type) ->
    @type == type

  next: (string) ->
    @source[@pos..@pos + string.length - 1] == string

  space: ->
    @letter.match(/\s/)

  init: (node) ->
    @current.push(node)
    @parents.push(node)
    @current = node

    @current.source =
      start:
        line:   @line
        column: @column
      content: @source
    @current.source.file = path.resolve(@opts.from) if @opts.from
    @current.before = @buffer[0..-2]
    @buffer = ''

  raw: (value, raw) ->
    if value != raw
      new Raw(value, raw)
    else
      value

  fixEnd: (callback) ->
    if @letter == '}'
      start   = @buffer.search(/\s*\}$/)
      after   = @buffer[start..-2]
    else
      start   = @buffer.search(/\s*$/)
      after   = @buffer[start..-1]
    @buffer = @buffer[0..start]

    el = @current
    callback.apply(@)

    lines = after.match(/\n/g)
    if lines
      el.source.end.line  -= lines.length
      all  = @lines[el.source.end.line]
      last = after.indexOf("\n")
      last = after.length if last == -1
      el.source.end.column = all - last
    else
      el.source.end.column -= after.length

    @current.after = after
    @buffer = after

  pop: ->
    @current.source.end =
      line:   @line
      column: @column

    @popType()
    @parents.pop()
    @current = @parents[@parents.length - 1]
    @buffer  = ''

  addType: (type) ->
    @types.push(type)
    @type = type

  setType: (type) ->
    @types[@types.length - 1] = type
    @type = type

  popType: ->
    @types.pop()
    @type = @types[@types.length - 1]

  atruleType: ->
    name = @current.name.toLowerCase()
    if name == 'page' or name == 'font-face' or name[-8..-1] == 'viewport'
      'decls'
    else
      'rules'

  endAtruleParams: ->
    if @letter == '{'
      type = @atruleType()
      @current.addMixin(type)
      @setType(type)
      @buffer = ''
    else
      @current.semicolon = true if @letter == ';'
      @pop()

  checkAtruleName: ->
    @error('At-rule without name') if @current.name == ''

  startSpaces: (string) ->
    match = string.match(/^\s*/)
    if match
      pos = match[0].length
      [string[pos..-1], match[0]]
    else
      [string, '']

  endSpaces: (string) ->
    match = string.match(/\s*$/)
    if match
      pos = match[0].length + 1
      [string[0..-pos], match[0]]
    else
      [string, '']

module.exports = (source, opts = { }) ->
  opts = convertOptions(opts)

  parser = new Parser(source, opts)
  parser.loop()
  parser.setMap()

  parser.root
