Node = require('../lib/postcss/node')
Raw  = require('../lib/postcss/raw')

describe 'Node', ->

  describe '.prop()', ->

    it 'defines virtual property', ->
      class A extends Node
        @prop 'test',
          set: (v) -> @setted = v
          get: -> 1
      a = new A()

      a.test.should.eql(1)

      a.test = 2
      a.setted.should.eql(2)

  describe '.raw()', ->
    class B extends Node
      @raw 'one'

    it 'creates trimmed/raw property', ->
      b = new B()

      (b.one == undefined).should.true
      b._one.stringify().should.eql('')

      b.one = new Raw('raw', 'trim')
      b.one.should.eql('trim')
      b._one.stringify().should.eql('raw')

      b.one = 'trim1'
      b.one.should.eql('trim1')
      b._one.stringify().should.eql('trim1')

    it 'works without magic', ->
      b = new B()

      b.one = '1'
      b.one.should.eql('1')
      b._one.stringify().should.eql('1')
