var fs = require('fs');

css = fs.readFileSync(__dirname + '/../fixtures/bootstrap.css').toString();
CSSOM = require('cssom');

module.exports = function() {
  CSSOM.parse(css).toString();
};