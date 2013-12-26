Node   = require('./node')

# CSS comment between declarations or rules
class Comment extends Node
  constructor: ->
    @type = 'comment'
    super

  # Stringify declaration
  stringify: (builder) ->
    builder(@before) if @before
    left  = if @left? then @left else ' '
    right = if @right? then @right else ' '
    builder("/*#{ left + @text + right }*/", @)

module.exports = Comment
