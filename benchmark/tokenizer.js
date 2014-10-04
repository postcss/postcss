var fs = require('fs');

var tokenizer = require('../build/lib/tokenize');

var style = fs.readFileSync(__dirname + '/test.css').toString();

module.exports = {
    fn: function () {
        tokenizer(style);
    },
    maxTime: 15,
    name: 'Tokenizer'
};
