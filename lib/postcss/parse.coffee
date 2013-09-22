# Copyright 2013 Andrey Sitnik <andrey@sitnik.ru>,
# sponsored by Evil Martians.
#
# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU Lesser General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU Lesser General Public License for more details.
#
# You should have received a copy of the GNU Lesser General Public License
# along with this program.  If not, see <http:#www.gnu.org/licenses/>.

SyntexError = require('./syntax_error')
Declaration = require('./declaration')
Stylesheet  = require('./stylesheet')
AtRule      = require('./at_rule')
Rule        = require('./rule')

class Parser
  @parse = (source, options = { }) ->
    parser = new Parser(source, options)
    parser.loop()
    parser.stylesheet

  constructor: (@source, @options) ->
    @stylesheet = new Stylesheet()
    @current    = @stylesheet
    @parents    = [@current]
    @type       = 'statements'
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
    if @letter == '{' and (@inside('ruleset') or @inside('value'))
      @error("Unexpected { in #{ @type }")

    if @inside('property') and (@letter == '}' or @letter == ';')
      @error('Missing property value')

  isAtrule: ->
    if @letter == '@' and @inside('statements')
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
        @current.rawParams = ''
        @current.params    = ''

        if @letter == '{'
          @setType(@atruleType())
          @buffer = ''
        else
          @pop()
          @buffer = @letter unless finish

      else
        @current.name += @letter
      true

    else if @inside('atrule-param')
      if @letter == ';' or @letter == '{' or finish
        @current.rawParams = if finish then @buffer else @prevBuffer()
        @current.params    = @trim @trimmed

        if @letter == '{'
          @setType(@atruleType())
          @buffer = ''
        else
          @pop()
          @buffer = @letter unless finish

      else
        @trimmed += @letter
      true

  inSelector: ->
    if @inside('selector')
      if @letter == '{'
        @current.rawSelector = @prevBuffer()
        @current.selector    = @trim @trimmed
        @buffer = ''
        @setType('ruleset')
      else
        @trimmed += @letter
      true

  isSelector: ->
    if not @space() and @inside('statements')
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
        @inValue(true) if @inside('value')
        @current.after = @prevBuffer()
        @pop()
      true

  inProperty: ->
    if @inside('property')
      if @letter == ':'
        if @buffer[0] == '*' or @buffer[0] == '_'
          @current.before += @buffer[0]
          @trimmed = @trimmed[1..-1]
          @buffer  = @buffer[1..-1]

        @current.property = @trim @trimmed
        @current.between  = @prevBuffer()[@current.property.length..-1]
        @buffer = ''

        @setType('value')
        @trimmed = ''
      else if @letter == '{'
        @error('Unexpected { in ruleset')
      else
        @trimmed += @letter
      true

  isProperty: ->
    if @inside('ruleset') and not @space() and @letter != ';'
      @init new Declaration()
      @addType('property')
      @buffer = @letter
      @trimmed = @letter
      true

  inValue: (finish) ->
    if @inside('value')
      if @letter == ';' or finish
        @current.rawValue = @prevBuffer()
        @current.value    = @trim @trimmed

        if @current.value[-11..-1] == ' !important'
          @current.important = true
          @current.value = @trim @current.value[0..-11]

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
      'ruleset'
    else
      'statements'

  checkAtruleName: ->
    @error('At-rule without name') if @current.name == ''

  trim: (string) ->
    string.replace(/^\s*/, '').replace(/\s*$/, '')

module.exports = Parser.parse
