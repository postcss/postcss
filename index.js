require('coffee-script').register();

var traceur = require('traceur');
traceur.require.makeDefault(function(filename) {
    return filename.indexOf('node_modules') === -1;
});

module.exports = require('./lib/postcss');
