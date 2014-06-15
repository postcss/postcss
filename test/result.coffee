Result = require('../lib/result')
parse  = require('../lib/parse')

describe 'Result', ->
  beforeEach ->
    @root = parse('a {}')

  describe 'root', ->

    it 'contains AST', ->
      result = new Result(@root)
      result.root.should.eql(@root)

  describe 'css', ->

    it 'will be stringified', ->
      result = new Result(@root)
      result.css.should.eql('a {}')

    it 'contains CSS', ->
      result = new Result(@root, 'b {}')
      result.css.should.eql('b {}')

    it 'stringifies', ->
      result = new Result(@root, 'a {}')
      ('' + result).should.eql(result.css)

  describe 'map', ->

    it 'exists only if necessary', ->
      result = new Result(@root, 'a {}')
      result.should.not.have.property('map')

      result = new Result(@root, 'a {}', { one: 1 })
      result.map.should.eql({ one: 1 })
