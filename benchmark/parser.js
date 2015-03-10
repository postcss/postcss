var path = require('path');
var fs   = require('fs');

var tokenizer = require('../build/lib/tokenize');
var Parser    = require('../build/lib/parser');
var Input     = require('../build/lib/input');

var css    = fs.readFileSync(path.join(__dirname, 'test.css'));
var input  = new Input(css);
var tokens = tokenizer(input);

module.exports = {
    fn: function () {
        var parser = new Parser(input);
        parser.tokens = tokens.slice();
        parser.loop();
    },
    maxTime: 15,
    name: 'Parser'
};
