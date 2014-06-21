Result = require('../lib/result')
parse  = require('../lib/parse')

mozilla = require('source-map')

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

    it 'stringifies', ->
      result = new Result(@root, 'a {}')
      ('' + result).should.eql(result.css)

  describe 'map', ->

    it 'exists only if necessary', ->
      result = new Result(@root)
      (result.map == undefined).should.be.true

      result = new Result(@root, map: true)
      result.map.should.be.a.instanceOf(mozilla.SourceMapGenerator)
