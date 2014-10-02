var fs = require('fs');

css = fs.readFileSync(__dirname + '/../fixtures/bootstrap.css').toString();
gonzalesPe = require('gonzales-pe');

module.exports = function() {
  gonzalesPe.astToSrc({ast: gonzalesPe.srcToAST({ src: css })});
};