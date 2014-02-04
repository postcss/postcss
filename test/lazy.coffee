lazy = require('../lib/lazy')

describe 'lazy()', ->
  calcValue = null
  class A
    lazy @, 'calc', -> calcValue

  beforeEach -> @a = new A()

  it 'defines method', ->
    calcValue = 1
    @a.calc().should.eql 1

  it 'caches value', ->
    calcValue = 2
    @a.calc().should.eql 2
    calcValue = 3
    @a.calc().should.eql 2

  it 'caches false', ->
    calcValue = false
    @a.calc().should.be.false
    calcValue = true
    @a.calc().should.be.false
