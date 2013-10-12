Declaration = require('../lib/postcss/declaration')
Container   = require('../lib/postcss/container')
parse       = require('../lib/postcss/parse')

fs = require('fs')

read = (file) ->
  fs.readFileSync(__dirname + "/cases/container/#{ file }.css").toString()

describe 'Container', ->
  beforeEach ->
    @css  = parse read('base')
    @rule = @css.rules[0]

  describe 'push()', ->

    it 'adds child without checks', ->
      child = new Declaration()
      child.prop  = 'new'
      child.value = 'value'
      @rule.push(child)

      @css.toString().should.eql read('push')

  describe 'append()', ->

    it 'appends child', ->
      child = new Declaration()
      child.prop  = 'new'
      child.value = 'value'
      @rule.append(child)

      @css.toString().should.eql read('append')

  describe 'prepend()', ->

    it 'prepends child', ->
      child = new Declaration()
      child.prop  = 'new'
      child.value = 'value'
      @rule.prepend(child)

      @css.toString().should.eql read('prepend')

  describe 'insertBefore()', ->

    it 'inserts child', ->
      child = new Declaration()
      child.prop  = 'new'
      child.value = 'value'
      @rule.insertBefore(1, child)

      @css.toString().should.eql read('insert')

    it 'works with nodes too', ->
      child = new Declaration()
      child.prop  = 'new'
      child.value = 'value'
      @rule.insertBefore(@rule.decls[1], child)

      @css.toString().should.eql read('insert')

  describe 'insertAfter()', ->

    it 'inserts child', ->
      child = new Declaration()
      child.prop  = 'new'
      child.value = 'value'
      @rule.insertAfter(0, child)

      @css.toString().should.eql read('insert')

    it 'works with nodes too', ->
      child = new Declaration()
      child.prop  = 'new'
      child.value = 'value'
      @rule.insertAfter(@rule.decls[0], child)

      @css.toString().should.eql read('insert')
