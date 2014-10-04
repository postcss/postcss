var fs = require('fs');

css = fs.readFileSync(__dirname + '/../fixtures/bootstrap.css').toString();
CSSOM = require('cssom');

module.exports = {
  maxTime: 15,
  fn: function() {
    CSSOM.parse(css).toString();
  },
  name: "CSSOM"
};