Root  = require('../lib/root')
parse = require('../lib/parse')

fs = require('fs')

describe 'Root', ->

  describe 'toString()', ->

    fs.readdirSync(__dirname + '/cases/parse/').forEach (file) ->
      return unless file.match(/\.css$/)

      it "stringify #{ file }", ->
        css = fs.readFileSync(__dirname + '/cases/parse/' + file).toString()
        parse(css).toString().should.eql(css)
