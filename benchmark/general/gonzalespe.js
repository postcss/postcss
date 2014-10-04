var fs = require('fs');

css = fs.readFileSync(__dirname + '/../fixtures/bootstrap.css').toString();
gonzales = require('gonzales');

module.exports = {
  maxTime: 15,
  fn: function() {
    gonzales.csspToSrc( gonzales.srcToCSSP(css) );
  },
  name: "GonzalesPE"
};