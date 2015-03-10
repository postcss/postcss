var path = require('path');

var escape = function (str) {
    return str.replace(/[\[\]\/{}()*+?.\\^$|-]/g, '\\$&');
};

var regexp = ['lib', 'test'].map(function (i) {
    return '^' + escape(path.join(__dirname, i) + path.sep);
}).join('|');

require('babel/register')({
    only:   new RegExp('(' + regexp + ')'),
    ignore: false,
    loose: 'all'
});
module.exports = require('./lib/postcss');
