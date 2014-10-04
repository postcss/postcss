var fs = require('fs');

var tokenizer = require('../build/lib/tokenize');
var Parser    = require('../build/lib/parse').Parser;

var style  = fs.readFileSync(__dirname + '/test.css').toString();
var tokens = tokenizer(style);

module.exports = {
    fn: function () {
        var parser = new Parser(style, { });
        parser.tokens = tokens.slice();
        parser.setMap();
        parser.loop();
    },
    maxTime: 15,
    name: 'Parser'
};
