# Error while CSS parsing
class SyntaxError extends Error
  constructor: (text, @source, pos, @file) ->
    @line     = pos.line
    @column   = pos.column
    @message  = "Can't parse CSS: #{ text }"
    @message += " at line #{ pos.line }:#{ pos.column }"
    @message += " in #{ @file }" if @file

module.exports = SyntaxError
