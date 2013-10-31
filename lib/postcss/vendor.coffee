# Methods to work with vendor prefixes
vendor =

  # Split property name to vendor prefix and unprefixed origin name
  #
  #   vendor.split('-moz-color').prefix  #=> '-moz-'
  #   vendor.split('-moz-color').name    #=> 'color'
  #
  #   vendor.split('color').name #=> 'color'
  split: (prop) ->
    if prop[0] == '-'
      separator  = prop.indexOf('-', 1) + 1
      prefix     = prop[0...separator]
      unprefixed = prop[separator..-1]
      { prefix: prefix, name: unprefixed }
    else
      { prefix: '', name: prop }

module.exports = vendor
