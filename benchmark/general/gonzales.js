var fs = require('fs');

var css = fs.readFileSync(__dirname + '/../cache/bootstrap.css').toString();
var gonzales = require('gonzales');

module.exports = {
    fn: function() {
        return gonzales.csspToSrc( gonzales.srcToCSSP(css) );
    },
    maxTime: 15,
    name: 'Gonzales'
};
