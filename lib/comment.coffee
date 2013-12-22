Node   = require('./node')

# CSS comment between declarations or rules
class Comment extends Node
  constructor: ->
    @type = 'comment'
    super

  @raw 'content'

  # Stringify declaration
  stringify: (builder) ->
    builder(@before) if @before
    content = @_content.stringify(before: ' ', after: ' ')
    console.log('')
    builder("/*#{ content }*/", @)

module.exports = Comment
