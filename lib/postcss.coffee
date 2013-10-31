Root = require('./root')

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
    for processor in @processors
      returned = processor(parsed)
      parsed   = returned if returned instanceof Root
    parsed.toString()

# Framework for CSS postprocessors
#
# var processor = postcss(function (css) {
#     // Change nodes in css
# });
# processor.process(css)
postcss = (processors...) ->
  new PostCSS(processors)

# Compile CSS to nodes
postcss.parse = require('./parse')

module.exports = postcss
