var fs = require('fs');

css = fs.readFileSync(__dirname + '/../fixtures/bootstrap.css').toString();
gonzales = require('gonzales');

module.exports = function() {
  gonzales.csspToSrc( gonzales.srcToCSSP(css) );
};