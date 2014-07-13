var traceur = require('traceur');

traceur.require.makeDefault(function(file) {
    return file.indexOf(__dirname + '/lib')  != -1 ||
           file.indexOf(__dirname + '/test') != -1 ;
});

module.exports = require('./lib/postcss');
