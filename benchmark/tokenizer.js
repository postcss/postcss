var path = require('path');
var fs   = require('fs');

var tokenizer = require('../build/lib/tokenize');
var Input     = require('../build/lib/input');

var css   = fs.readFileSync(path.join(__dirname, 'test.css'));
var input = new Input(css);

module.exports = {
    fn: function () {
        tokenizer(input);
    },
    maxTime: 15,
    name: 'Tokenizer'
};
