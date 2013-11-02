Declaration = require('../lib/declaration')

describe 'Declaration', ->

  it 'initializes with properties', ->
    decl = new Declaration(prop: 'color', value: 'black')

    decl.prop.should.eql('color')
    decl.value.should.eql('black')

  describe 'prefix', ->

    it 'should remove vendor prefix', ->
      decl = new Declaration(prop: '-webkit-filter', value: 'none')
      decl.prefix.should.eql('-webkit-')

      decl = new Declaration(prop: 'color', value: 'black')
      decl.prefix.should.eql('')

  describe 'unprefixed', ->

    it 'should remove vendor prefix', ->
      decl = new Declaration(prop: '-webkit-filter', value: 'none')
      decl.unprefixed.should.eql('filter')

      decl = new Declaration(prop: 'color', value: 'black')
      decl.unprefixed.should.eql('color')

  describe 'clone()', ->

    it 'cleans parent and before', ->
      decl  = new Declaration(prop: 'color', value: 'black', before: "\n    ")
      clone = decl.clone(value: 'white')

      clone.value.should.eql('white')
      (clone.parent == undefined).should.be.true
      (clone.before == undefined).should.be.true

  describe 'toString()', ->

    it 'inserts default spaces', ->
      decl = new Declaration(prop: 'color', value: 'black')
      decl.toString().should.eql('color: black')
