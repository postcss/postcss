fs = require('fs');
var style = fs.readFileSync(__dirname + '/fixtures/test.css').toString();
var tokenizer = require('build/lib/tokenize');
module.exports = {
  fn: function() {
    tokenizer(style);
  },
  maxTime: 15,
  name: 'Tokenizer'
};
