var fs = require('fs');

var css = fs.readFileSync(__dirname + '/../cache/bootstrap.css').toString();
var rework = require('rework');

module.exports = {
    fn: function() {
        return rework(css).toString();
    },
    maxTime: 15,
    name: 'Rework'
};
