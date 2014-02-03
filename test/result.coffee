Result = require('../lib/result')

describe 'Result', ->

  describe 'css', ->

    it 'contains CSS', ->
      result = new Result('a {}')
      result.css.should.eql('a {}')

    it 'stringifies', ->
      result = new Result('a {}')
      ('' + result).should.eql(result.css)

  describe 'map', ->

    it 'exists only if necessary', ->
      result = new Result('a {}')
      result.should.not.have.property('map')

      result = new Result('a {}', 'A')
      result.map.should.eql('A')
