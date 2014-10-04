var fs = require('fs');

css = fs.readFileSync(__dirname + '/../fixtures/bootstrap.css').toString();
gonzalesPe = require('gonzales-pe');

module.exports = {
  maxTime: 15,
  fn: function() {
    gonzalesPe.astToSrc({ast: gonzalesPe.srcToAST({ src: css })});
  },
  name: "Gonzales"
};