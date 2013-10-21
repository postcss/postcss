SyntexError = require('./syntax-error')
Declaration = require('./declaration')
Stylesheet  = require('./stylesheet')
AtRule      = require('./at-rule')
Rule        = require('./rule')
Raw         = require('./raw')

# CSS parser
class Parser
  constructor: (source, @options) ->
    @source = source.toString()

    @stylesheet = new Stylesheet()
    @current    = @stylesheet
    @parents    = [@current]
    @type       = 'rules'
    @types      = [@type]

    @pos    = -1
    @line   = 1
    @column = 0
    @buffer = ''

  loop: ->
    while @pos < @source.length - 1
      @move()
      @nextLetter()
    @endFile()

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
        @popType()
        @move()
      true

  isComment: ->
    if @next('/*')
      @commentPos = line: @line, column: @column
      @addType('comment')
      @move()
      true

  isWrong: ->
    if @letter == '{' and (@inside('decls') or @inside('value'))
      @error("Unexpected {")

    if @inside('property') and (@letter == '}' or @letter == ';')
      @error('Missing property value')

  isAtrule: ->
    if @letter == '@' and @inside('rules')
      @init new AtRule()
      @current.name = ''
      @addType('atrule-name')
      true

  inAtrule: (finish) ->
    if @inside('atrule-name')
      if @space()
        @checkAtruleName()
        @buffer  = @buffer[@current.name.length..-1]
        @trimmed = ''
        @setType('atrule-param')

      else if @letter == ';' or @letter == '{' or finish
        @checkAtruleName()
        @endAtruleParams(finish)

      else
        @current.name += @letter
      true

    else if @inside('atrule-param')
      if @letter == ';' or @letter == '{' or finish
        @current.params = new Raw(@prevBuffer(), @trim @trimmed)
        @endAtruleParams(finish)

      else
        @trimmed += @letter
      true

  inSelector: ->
    if @inside('selector')
      if @letter == '{'
        @current.selector = new Raw(@prevBuffer(), @trim @trimmed)
        @semicolon = false
        @buffer    = ''
        @setType('decls')
      else
        @trimmed += @letter
      true

  isSelector: ->
    if not @space() and @inside('rules')
      @init new Rule()
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
          start = @buffer.search(/\s*\}$/)
          after = @buffer[start..-2]

          @buffer = @buffer[0..start]
          @inValue(true)

          @current.after = after
        else
          @current.semicolon = true if @semicolon
          @current.after     = @prevBuffer()
        @pop()
      true

  inProperty: ->
    if @inside('property')
      if @letter == ':'
        if @buffer[0] == '*' or @buffer[0] == '_'
          @current.before += @buffer[0]
          @trimmed = @trimmed[1..-1]
          @buffer  = @buffer[1..-1]

        @current.prop    = @trim @trimmed
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
      @addType('property')
      @buffer    = @letter
      @trimmed   = @letter
      @semicolon = false
      true

  inValue: (finish) ->
    if @inside('value')
      if @letter == '('
        @inBrackets = true
      else if @inBrackets and @letter == ')'
        @inBrackets = false

      if (@letter == ';' and not @inBrackets) or finish
        @semicolon = true if @letter == ';'
        @current.value = new Raw(@prevBuffer(), @trim @trimmed)
        @pop()
      else
        @trimmed += @letter

      true

  unknown: ->
    @error("Unexpected symbol #{ @letter }") unless @space

  endFile: ->
    if @inside('atrule-param') or @inside('atrule-name')
      @inAtrule(true)

    if @parents.length > 1
      @error('Unclosed block', @current.line, @current.column)
    else if @inside('comment')
      @error('Unclosed comment', @commentPos.line, @commentPos.column)
    else if @quote
      @error('Unclosed quote', @quotePos.line, @quotePos.column)
    else
      @stylesheet.after = @buffer

  # Helpers

  error: (message, line = @line, column = @column) ->
    throw new SyntexError(message, @source, line, column, @options.file)

  move: ->
    @pos    += 1
    @column += 1
    @letter  = @source[@pos]
    @buffer += @letter

    if @letter == "\n"
      @line  += 1
      @column = 0

  prevBuffer: ->
    @buffer[0..-2]

  inside: (type) ->
    @type == type

  next: (string) ->
    @source[@pos..@pos + string.length - 1] == string

  space: ->
    @letter == ' ' or @letter == "\n" or @letter == "\f" or @letter == "\r"

  init: (node) ->
    @current.push(node)
    @parents.push(node)
    @current = node

    node.line   = @line
    node.column = @column
    node.before = @buffer[0..-2]
    @buffer = ''

  pop: ->
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
    if name == 'page' or name == 'font-face'
      'decls'
    else
      'rules'

  endAtruleParams: (finish) ->
    if @letter == '{'
      type = @atruleType()
      @current.addMixin(type)
      @setType(type)
      @buffer = ''
    else
      @current.semicolon = true if @letter == ';'
      @pop()
      @buffer = @letter if @letter != ';'

  checkAtruleName: ->
    @error('At-rule without name') if @current.name == ''

  trim: (string) ->
    string.replace(/^\s*/, '').replace(/\s*$/, '')

module.exports = (source, options = { }) ->
  parser = new Parser(source, options)
  parser.loop()
  parser.stylesheet
