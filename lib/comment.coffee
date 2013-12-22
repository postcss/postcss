Node   = require('./node')

# CSS comment between declarations or rules
class Comment extends Node
  constructor: ->
    @type = 'comment'
    super

  @raw 'text'

  # Stringify declaration
  stringify: (builder) ->
    builder(@before) if @before
    text = @_text.stringify(before: ' ', after: ' ')
    builder("/*#{ text }*/", @)

module.exports = Comment
