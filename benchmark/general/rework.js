var fs = require('fs');

css = fs.readFileSync(__dirname + '/../fixtures/bootstrap.css').toString();
rework = require('rework');

module.exports = function() {
  rework(css).toString();
};