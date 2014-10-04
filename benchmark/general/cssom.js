var fs = require('fs');

var css = fs.readFileSync(__dirname + '/../cache/bootstrap.css').toString();
var CSSOM = require('cssom');

module.exports = {
    fn: function() {
        return CSSOM.parse(css).toString();
    },
    maxTime: 15,
    name: 'CSSOM'
};
