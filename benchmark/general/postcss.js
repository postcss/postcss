var fs = require('fs');

var css = fs.readFileSync(__dirname + '/../cache/bootstrap.css').toString();
var processor = require('../../build/')();

module.exports = {
    fn: function() {
        return processor.process(css).css;
    },
    maxTime: 15,
    name: 'PostCSS'
};
