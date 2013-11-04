# Methods to work with vendor prefixes
vendor =

  # Return vendor prefix from property name, if it exists
  #
  #   vendor.prefix('-moz-box-sizing') #=> '-moz-'
  #   vendor.prefix('box-sizing')      #=> ''
  prefix: (prop) ->
    if prop[0] == '-'
      separator = prop.indexOf('-', 1) + 1
      prop[0...separator]
    else
      ''

  # Remove prefix from property name
  #
  #   vendor.prefix('-moz-box-sizing') #=> 'box-sizing'
  #   vendor.prefix('box-sizing')      #=> 'box-sizing'
  unprefixed: (prop) ->
    if prop[0] == '-'
      separator = prop.indexOf('-', 1) + 1
      prop[separator..-1]
    else
      prop

module.exports = vendor
