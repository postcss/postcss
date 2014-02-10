Declaration = require('../lib/declaration')
parse       = require('../lib/parse')

describe 'Declaration', ->

  it 'initializes with properties', ->
    decl = new Declaration(prop: 'color', value: 'black')

    decl.prop.should.eql('color')
    decl.value.should.eql('black')

  describe 'important', ->

    it 'returns boolean', ->
      decl = new Declaration
        prop:       'color'
        value:      'black'
        _important: '  !important'

      decl.important.should.be.true

    it 'adds virtual property', ->
      decl = new Declaration(prop: 'color', value: 'black')
      decl.important.should.be.false

      decl.important = true
      decl.important.should.be.true
      decl.toString().should.eql 'color: black !important'

      decl.important = ' !important /*very*/'
      decl.important.should.be.true
      decl.toString().should.eql 'color: black !important /*very*/'

      decl.important = false
      decl.important.should.be.false
      decl.toString().should.eql 'color: black'

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

    it 'clone spaces from another declaration', ->
      root = parse('a{color:black}')
      decl = new Declaration(prop: 'margin', value: '0')
      root.first.append(decl)

      decl.toString().should.eql('margin:0')
