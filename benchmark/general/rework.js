var fs = require('fs');

css = fs.readFileSync(__dirname + '/../fixtures/bootstrap.css').toString();
rework = require('rework');

module.exports = {
  maxTime: 15,
  fn: function() {
    rework(css).toString();
  },
  name: "Rework"
};