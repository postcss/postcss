var fs = require('fs');

css = fs.readFileSync(__dirname + '/../fixtures/bootstrap.css').toString();
processor = require('../../build')();

module.exports = function() {
  processor.process(css).css;
};