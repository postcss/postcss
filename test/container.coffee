Declaration = require('../lib/declaration')
Container   = require('../lib/container')
parse       = require('../lib/parse')

fs = require('fs')

read = (file) ->
  fs.readFileSync(__dirname + "/cases/container/#{ file }.css").toString()

compare = (css, ideal) ->
  css.toString().should.eql read(ideal)

describe 'Container', ->
  beforeEach ->
    @css  = parse read('base')
    @rule = @css.rules[0]

    @new  = new Declaration()
    @new.prop  = 'new'
    @new.value = 'value'

  describe 'push()', ->

    it 'adds child without checks', ->
      @rule.push(@new)
      compare(@css, 'push')

  describe 'each()', ->

    it 'iterates', ->
      indexes = []

      result = @rule.each (decl, i) =>
        indexes.push(i)
        decl.should.eql( @rule.decls[i] )

      (result == undefined).should.be.true
      indexes.should.eql [0, 1]

    it 'iterates with prepend', ->
      size = 0
      @rule.each =>
        @rule.prepend({ prop: 'color', value: 'black' })
        size += 1
      size.should.eql(2)

    it 'iterates with insertBefore', ->
      size = 0
      @rule.each (decl) =>
        @rule.insertBefore(decl, { prop: 'color', value: 'black' })
        size += 1
      size.should.eql(2)

    it 'iterates with insertAfter', ->
      size = 0
      @rule.each (decl, i) =>
        @rule.insertBefore(i - 1, { prop: 'color', value: 'black' })
        size += 1
      size.should.eql(2)

    it 'iterates with remove', ->
      size = 0
      @rule.each =>
        @rule.remove(0)
        size += 1
      size.should.eql(2)

    it 'breaks iteration', ->
      indexes = []

      result = @rule.each (decl, i) =>
        indexes.push(i)
        return false

      result.should.be.false
      indexes.should.eql [0]

  describe 'eachInside()', ->
    beforeEach ->
      @css = parse read('each-recursivelly')

    it 'iterates', ->
      types   = []
      indexes = []

      result = @css.eachInside (node, i) ->
        types.push(node.type)
        indexes.push(i)

      (result == undefined).should.be.true
      types.should.eql   ['rule', 'decl', 'decl', 'comment', 'atrule',
                          'comment', 'rule', 'decl', 'atrule', 'rule', 'decl',
                          'atrule', 'decl', 'comment']
      indexes.should.eql [0, 0, 1, 1, 2, 0, 1, 0, 3, 0, 0, 1, 0, 1]

    it 'breaks iteration', ->
      indexes = []

      result = @css.eachInside (decl, i) ->
        indexes.push(i)
        return false

      result.should.be.false
      indexes.should.eql [0]

  describe 'eachDecl()', ->
    beforeEach ->
      @css = parse read('each-recursivelly')

    it 'iterates', ->
      props   = []
      indexes = []

      result = @css.eachDecl (decl, i) ->
        props.push(decl.prop)
        indexes.push(i)

      (result == undefined).should.be.true
      props.should.eql   ['a', 'b', 'c', 'd', 'e']
      indexes.should.eql [0, 1, 0, 0, 0]

    it 'iterates with changes', ->
      size = 0
      @css.eachDecl (decl, i) ->
        decl.parent.remove(i)
        size += 1
      size.should.eql(5)

    it 'breaks iteration', ->
      indexes = []

      result = @css.eachDecl (decl, i) =>
        indexes.push(i)
        return false

      result.should.be.false
      indexes.should.eql [0]

  describe 'eachComment()', ->
    beforeEach ->
      @css = parse read('each-recursivelly')

    it 'iterates', ->
      texts   = []
      indexes = []

      result = @css.eachComment (comment, i) ->
        texts.push(comment.text)
        indexes.push(i)

      (result == undefined).should.be.true
      texts.should.eql   ['a', 'b', 'c']
      indexes.should.eql [1, 0, 1]

    it 'iterates with changes', ->
      size = 0
      @css.eachComment (comment, i) ->
        comment.parent.remove(i)
        size += 1
      size.should.eql(3)

    it 'breaks iteration', ->
      indexes = []

      result = @css.eachComment (comment, i) =>
        indexes.push(i)
        return false

      result.should.be.false
      indexes.should.eql [1]

  describe 'eachRule()', ->
    beforeEach ->
      @css = parse read('each-recursivelly')

    it 'iterates', ->
      selectors = []
      indexes   = []

      result = @css.eachRule (rule, i) ->
        selectors.push(rule.selector)
        indexes.push(i)

      (result == undefined).should.be.true
      selectors.should.eql ['a', 'to', 'em']
      indexes.should.eql   [0, 1, 0]

    it 'iterates with changes', ->
      size = 0
      @css.eachRule (rule, i) ->
        rule.parent.remove(i)
        size += 1
      size.should.eql(3)

    it 'breaks iteration', ->
      indexes = []

      result = @css.eachRule (rule, i) =>
        indexes.push(i)
        return false

      result.should.be.false
      indexes.should.eql [0]

  describe 'eachAtRule()', ->
    beforeEach ->
      @css = parse read('each-recursivelly')

    it 'iterates', ->
      names   = []
      indexes = []

      result = @css.eachAtRule (atrule, i) ->
        names.push(atrule.name)
        indexes.push(i)

      (result == undefined).should.be.true
      names.should.eql   ['keyframes', 'media', 'page']
      indexes.should.eql [2, 3, 1]

    it 'iterates with changes', ->
      size = 0
      @css.eachAtRule (atrule, i) ->
        atrule.parent.remove(i)
        size += 1
      size.should.eql(3)

    it 'breaks iteration', ->
      indexes = []

      result = @css.eachAtRule (atrule, i) =>
        indexes.push(i)
        return false

      result.should.be.false
      indexes.should.eql [2]

  describe 'append()', ->

    it 'appends child', ->
      @rule.append(@new)
      compare(@css, 'append')

    it 'receive hash instead of declaration', ->
      @rule.append(prop: 'new', value: 'value')
      compare(@css, 'append')

  describe 'prepend()', ->

    it 'prepends child', ->
      @rule.prepend(@new)
      compare(@css, 'prepend')

    it 'receive hash instead of declaration', ->
      @rule.prepend(prop: 'new', value: 'value')
      compare(@css, 'prepend')

  describe 'insertBefore()', ->

    it 'inserts child', ->
      @rule.insertBefore(1, @new)
      compare(@css, 'insert')

    it 'works with nodes too', ->
      @rule.insertBefore(@rule.decls[1], @new)
      compare(@css, 'insert')

    it 'receive hash instead of declaration', ->
      @rule.insertBefore(1, prop: 'new', value: 'value')
      compare(@css, 'insert')

  describe 'insertAfter()', ->

    it 'inserts child', ->
      @rule.insertAfter(0, @new)
      compare(@css, 'insert')

    it 'works with nodes too', ->
      @rule.insertAfter(@rule.decls[0], @new)
      compare(@css, 'insert')

    it 'receive hash instead of declaration', ->
      @rule.insertAfter(0, prop: 'new', value: 'value')
      compare(@css, 'insert')

  describe 'remove()', ->

    it 'should remove by index', ->
      @rule.remove(1)
      compare(@css, 'remove')

    it 'should remove by nide', ->
      @rule.remove( @rule.decls[1] )
      compare(@css, 'remove')

  describe 'any()', ->

    it 'return true if all childs return true', ->
      @rule.every( (i) -> i.prop.match(/a|b/) ).should.be.true
      @rule.every( (i) -> i.prop.match(/b/) ).should.be.false

  describe 'some()', ->

    it 'return true if all childs return true', ->
      @rule.some( (i) -> i.prop == 'b' ).should.be.true
      @rule.some( (i) -> i.prop == 'c' ).should.be.false

  describe 'index()', ->

    it 'returns child index', ->
      @rule.index( @rule.decls[1] ).should.eql(1)

    it 'returns argument if it is number', ->
      @rule.index(2).should.eql(2)

  describe 'first', ->

    it 'returns first child', ->
      @rule.first.prop.should.eql 'a'

  describe 'last', ->

    it 'returns last child', ->
      @rule.last.prop.should.eql 'b'

  describe 'normalize()', ->

    it "doesn't normalize new childs with exists before", ->
      @new.before = "\n        "
      @rule.append(@new)
      compare(@css, 'indent')
