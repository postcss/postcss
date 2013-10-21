# List of functions to process CSS
class PostCSS
  constructor: (@processors = []) ->

  # Add another function to CSS processors
  use: (processor) ->
    @processors.push(processor)
    this

  # Process CSS throw installed processors
  process: (css, options = {}) ->
    parsed = postcss.parse(css, options)
    i(parsed) for i in @processors
    parsed.toString()

# Framework for CSS postproccessors
#
# var processor = postcss(function (css) {
#     // Change nodes in css
# });
# processor.process(css)
postcss = (processors...) ->
  new PostCSS(processors)

# Compile CSS to nodes
postcss.parse = require('./postcss/parse')

module.exports = postcss
