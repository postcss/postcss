# Error while CSS parsing
class SyntaxError extends Error
  constructor: (text, @source, @line, @column, @file) ->
    @message = "#{ text } at line #{ @line }:#{ @column }"
    @message += " in #{ @file }" if @file

module.exports = SyntaxError
