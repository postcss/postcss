Declaration = require('../lib/postcss/declaration')

describe 'Declaration', ->

  it 'fast sets properties', ->
    decl = new Declaration(prop: 'color', value: 'black')

    decl.prop.should.eql('color')
    decl.value.should.eql('black')
