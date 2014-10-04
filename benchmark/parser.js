fs = require('fs');
style = fs.readFileSync(__dirname + '/fixtures/test.css').toString();
tokens = JSON.parse(fs.readFileSync(__dirname + '/fixtures/tokens.json'));
tokenize = function() {
  return tokens.slice();
}
Parser = require('../build/lib/parse').Parser;
module.exports = {
  fn: function() {
    var parser = new Parser(style, {}, tokenize);
    parser.setMap();
    parser.loop();
  },
  maxTime: 15,
  name: 'Parser'
};
