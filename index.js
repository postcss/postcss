var path = require('path');

var root   = __dirname.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
var escape = function (str) {
    return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
};

var regexp = ['lib', 'test'].map(function (i) {
    return escape(path.join(__dirname, i));
}).join('|');

require('6to5/register')({ only: new RegExp(regexp) });
module.exports = require('./lib/postcss');
