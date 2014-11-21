var path = require('path');

var escape = function (str) {
    return str.replace(/[\[\]\/{}()*+?.\\^$|-]/g, "\\$&");
};

var regexp = ['lib', 'test'].map(function (i) {
    return '^' + escape(path.join(__dirname, i) + path.sep);
}).join('|');

require('6to5/register')({
    only:   new RegExp('(' + regexp + ')'),
    ignore: null
});
module.exports = require('./lib/postcss');
