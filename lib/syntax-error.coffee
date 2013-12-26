# Error while CSS parsing
class SyntaxError extends Error
  constructor: (cause, @source, @file, @line, @column) ->
    @message = "Can't parse CSS: #{ cause } at #{ @positionString(@file, @line, @column) }"

  positionString: (file, line, column) ->
    if file
      "#{file}:#{line}:#{column}"
    else
      "line #{line}:#{column}"

module.exports = SyntaxError
