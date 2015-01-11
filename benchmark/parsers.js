var fs  = require('fs');
var css = fs.readFileSync(__dirname + '/cache/bootstrap.css').toString();

var CSSOM      = require('cssom');
var rework     = require('rework');
var mensch     = require('mensch');
var postcss    = require('../build');
var stylecow   = require('stylecow');
var gonzales   = require('gonzales');
var gonzalesPe = require('gonzales-pe');

module.exports = {
    name:   'Bootstrap',
    maxTime: 15,
    tests: [
        {
            name: 'Rework',
            fn: function () {
                rework(css).toString();
            }
        },
        {
            name: 'PostCSS',
            fn: function () {
                postcss.parse(css).toResult().css;
            }
        },
        {
            name: 'CSSOM',
            fn: function () {
                CSSOM.parse(css).toString();
            }
        },
        {
            name: "Mensch",
            fn: function () {
                mensch.stringify( mensch.parse(css) );
            }
        },
        {
            name: 'Gonzales',
            fn: function () {
                gonzales.csspToSrc( gonzales.srcToCSSP(css) );
            }
        },
        {
            name: 'Gonzales PE',
            fn: function () {
                gonzalesPe.astToSrc({ ast: gonzalesPe.srcToAST({ src: css }) });
            }
        },
        {
            name: 'Stylecow',
            fn: function () {
                var file = new stylecow.Reader(css, 'cache/bootstrap.css');
                stylecow.Root.create(file).toString();
            }
        }
    ]
};
