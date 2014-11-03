var Parser = require('./parser');
var Input  = require('./input');

module.exports = function (css, opts) {
    var input = new Input(css, opts);

    var parser = new Parser(input);
    parser.tokenize();
    parser.loop();

    return parser.root;
};
