Node = require('../lib/node')
Raw  = require('../lib/raw')
Rule = require('../lib/rule')

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

    it 'clone spaces on changes', ->
      b = new B()
      b.one = new Raw(' 1 ', '1')
      b.one = '2'

      b.one.should.eql('2')
      b._one.stringify().should.eql(' 2 ')

  describe 'removeSelf()', ->

    it 'removes node from parent', ->
      rule = new Rule(selector: new Raw(' a ', 'a'))
      rule.append(prop: 'color', value: new Raw(' black', 'black'))

      rule.decls[0].removeSelf()
      rule.decls.should.be.empty

  describe 'clone()', ->

    it 'clones nodes', ->
      rule = new Rule(selector: new Raw(' a ', 'a'))
      rule.append(prop: 'color', value: new Raw(' black', 'black'))

      clone = rule.clone()
      clone.append(prop: 'display', value: 'none')

      clone.decls[0].parent.should.exactly clone
      rule.decls[0].parent.should.exactly  rule

      rule.toString().should.eql(' a {color: black}')
      clone.toString().should.eql(' a {color: black;display: none}')

    it 'overrides properties', ->
      clone = ( new Rule(selector: 'a') ).clone(selector: 'b')
      clone.selector.should.eql('b')

  describe 'toJSON()', ->

    it 'cleans parents inside', ->
      rule = new Rule(selector: new Raw('a', 'a'))
      rule.append(prop: 'color', value: new Raw('b', 'b'))

      json = rule.toJSON()
      (json.parent == undefined).should.be.true
      (json.decls[0].parent == undefined).should.be.true

      JSON.stringify(rule).should.eql('{"type":"rule","decls":[' +
        '{"type":"decl","prop":"color","_value":{"raw":"b","trimmed":"b"}}' +
      '],"_selector":{"raw":"a","trimmed":"a"}}')
