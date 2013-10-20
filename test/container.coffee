Declaration = require('../lib/postcss/declaration')
Container   = require('../lib/postcss/container')
parse       = require('../lib/postcss/parse')

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

  describe 'index()', ->

    it 'returns child index', ->
      @rule.index( @rule.decls[1] ).should.eql(1)

    it 'returns argument if it is number', ->
      @rule.index(2).should.eql(2)

  describe 'normalize()', ->

    it "doesn't normalize new childs with exists before", ->
      @new.before = "\n        "
      @rule.append(@new)
      compare(@css, 'indent')
