Declaration = require('../lib/postcss/declaration')

describe 'Declaration', ->

  it 'initializes with properties', ->
    decl = new Declaration(prop: 'color', value: 'black')

    decl.prop.should.eql('color')
    decl.value.should.eql('black')

  describe 'clone()', ->

    it 'cleans parent and before', ->
      decl  = new Declaration(prop: 'color', value: 'black', before: "\n    ")
      clone = decl.clone(value: 'white')

      clone.value.should.eql('white')
      (clone.parent == undefined).should.be.true
      (clone.before == undefined).should.be.true
