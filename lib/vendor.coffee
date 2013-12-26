# Methods to work with vendor prefixes
vendor =

  # Return vendor prefix from property name, if it exists
  #
  #   vendor.prefix('-moz-box-sizing') #=> '-moz-'
  #   vendor.prefix('box-sizing')      #=> ''
  prefix: (prop) ->
    prop.match(/^(-\w+-)/)?[1] || ''

  # Remove prefix from property name
  #
  #   vendor.prefix('-moz-box-sizing') #=> 'box-sizing'
  #   vendor.prefix('box-sizing')      #=> 'box-sizing'
  unprefixed: (prop) ->
    prop.match(/^(?:-\w+-)?(.+)/)?[1] || ''

module.exports = vendor
