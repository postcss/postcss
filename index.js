var path = require('path');

var root   = __dirname.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
var ignore = ['node_modules', 'tasks', 'build', 'benchmark', 'gulpfile.js'];
var escape = function (str) {
    return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
};

var regexp = ignore.map(function (i) {
    return escape(path.join(__dirname, i));
}).join('|');

require('6to5/register')(new RegExp(regexp));
module.exports = require('./lib/postcss');
