mozilla = require('source-map')
parse   = require('../lib/parse')
fs      = require('fs-extra')

describe 'PreviousMap', ->
  before ->
    @map = '{"version":3,"file":null,"sources":[],"names":[],"mappings":""}'
    @dir = __dirname + '/fixtures'

  afterEach ->
    fs.removeSync(@dir) if fs.existsSync(@dir)

  it 'miss property if no map', ->
    root = parse('a{}')
    root.should.not.have.property('prevMap')

  it 'creates property if map present', ->
    root = parse('a{}', map: @map)
    root.should.have.property('prevMap')
    root.prevMap.text.should.eql(@map)

  it 'returns consumer', ->
    root = parse('a{}', map: @map)
    root.prevMap.object().should.be.a.instanceOf(mozilla.SourceMapConsumer)

  it 'saves origin source', ->
    root = parse('a{}', map: @map)
    root.prevMap.source.should.eql('a{}')

  it 'sets annotation property', ->
    root = parse('a{}', map: @map)
    root.prevMap.should.not.have.property('annotation')

    root = parse('a{}/*# sourceMappingURL=a.css.map */', map: @map)
    root.prevMap.annotation.should.eql('# sourceMappingURL=a.css.map')

  it 'checks previous sources', ->
    map  = { version: 3, file: 'a.css', sources: [], names: [], mappings: ''}
    root = parse('a{}', map: map)
    root.prevMap.withSources.should.be.false

    map.sources.push('a{}')
    root = parse('a{}', map: map)
    root.prevMap.withSources.should.be.true

  it 'decode base64 maps', ->
    b64  = new Buffer(@map).toString('base64')
    css  = "a{}\n/*# sourceMappingURL=data:application/json;base64,#{b64} */"
    root = parse(css)

    root.prevMap.text.should.eql(@map)

  it 'decode URI maps', ->
    uri  = decodeURI(@map)
    css  = "a{}\n/*# sourceMappingURL=data:application/json,#{uri} */"
    root = parse(css)

    root.prevMap.text.should.eql(@map)

  it 'raises on unknown inline encoding', ->
    css = "a { }\n" +
          "/*# sourceMappingURL=data:application/json;" +
          "md5,68b329da9893e34099c7d8ad5cb9c940*/"

    ( -> parse(css) ).should.throw('Unsupported source map encoding md5')

  it 'raises on unknown map format', ->
    ( -> parse('a{}', map: 1) )
      .should.throw('Unsupported previous source map format: 1')

  it 'reads map near file', ->
    fs.outputFileSync(@dir + '/a.css.map', @map)
    root = parse('a{}', from: @dir + '/a.css')

    root.prevMap.text.should.eql(@map)

  it 'reads map from annotation', ->
    fs.outputFileSync(@dir + '/a.map', @map)
    root = parse("a{}\n/*# sourceMappingURL=a.map */", from: @dir + '/a.css')

    root.prevMap.text.should.eql(@map)
