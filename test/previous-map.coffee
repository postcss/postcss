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
    root = parse('a{}', map: { prev: @map })
    root.should.have.property('prevMap')
    root.prevMap.text.should.eql(@map)

  it 'returns consumer', ->
    root = parse('a{}', map: { prev: @map })
    root.prevMap.consumer().should.be.a.instanceOf(mozilla.SourceMapConsumer)

  it 'sets annotation property', ->
    root = parse('a{}', map: { prev: @map })
    root.prevMap.should.not.have.property('annotation')

    root = parse('a{}/*# sourceMappingURL=a.css.map */', map: { prev: @map })
    root.prevMap.annotation.should.eql('# sourceMappingURL=a.css.map')

  it 'checks previous sources content', ->
    map  = { version: 3, file: 'b', sources: ['a'], names: [], mappings: ''}
    root = parse('a{}', map: { prev: map })
    root.prevMap.withContent().should.be.false

    map.sourcesContent = ['a{}']
    root = parse('a{}', map: { prev: map })
    root.prevMap.withContent().should.be.true

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

  it 'remove map on request', ->
    uri  = decodeURI(@map)
    css  = "a{}\n/*# sourceMappingURL=data:application/json,#{uri} */"
    root = parse(css, map: { prev: false })

    root.should.not.have.property('prevMap')

  it 'raises on unknown inline encoding', ->
    css = "a { }\n" +
          "/*# sourceMappingURL=data:application/json;" +
          "md5,68b329da9893e34099c7d8ad5cb9c940*/"

    ( -> parse(css) ).should.throw('Unsupported source map encoding md5')

  it 'raises on unknown map format', ->
    ( -> parse('a{}', map: { prev: 1 }) )
      .should.throw('Unsupported previous source map format: 1')

  it 'reads map from annotation', ->
    fs.outputFileSync(@dir + '/a.map', @map)
    root = parse("a{}\n/*# sourceMappingURL=a.map */", from: @dir + '/a.css')

    root.prevMap.text.should.eql(@map)
