var fs = require('fs');

css = fs.readFileSync(__dirname + '/../fixtures/bootstrap.css').toString();
processor = require('../../build')();

module.exports = {
  maxTime: 15,
  fn: function() {
    processor.process(css).css;
  },
  name: "PostCSS"
};