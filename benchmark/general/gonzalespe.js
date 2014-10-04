var fs = require('fs');

var css = fs.readFileSync(__dirname + '/../cache/bootstrap.css').toString();
var gonzalesPe = require('gonzales-pe');

module.exports = {
    fn: function() {
        return gonzalesPe.astToSrc({
            ast: gonzalesPe.srcToAST({ src: css })
        });
    },
    maxTime: 15,
    name: 'Gonzales PE'
};
