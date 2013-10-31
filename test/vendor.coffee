vendor = require('../lib/vendor')

describe 'vendor', ->

  describe '.split()', ->

    it 'splits prefixed property', ->
      vendor.split('-moz-color').should.eql(prefix: '-moz-', name: 'color')

    it 'splits unprefixed property', ->
      vendor.split('color').should.eql(prefix: '', name: 'color')
