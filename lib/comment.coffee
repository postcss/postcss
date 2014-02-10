Node   = require('./node')

# CSS comment between declarations or rules
class Comment extends Node
  constructor: ->
    @type = 'comment'
    super

  defaults: -> { left: ' ', right: ' ' }

  # Stringify declaration
  stringify: (builder) ->
    builder(@before) if @before
    style = @style()
    builder("/*#{ style.left + @text + style.right }*/", @)

module.exports = Comment
