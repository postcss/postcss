var fs  = require('fs');
var css = fs.readFileSync(__dirname + '/cache/bootstrap.css').toString();

var CSSOM      = require('cssom');
var postcss    = require('../build');
var rework     = require('rework');
var stylecow   = require('stylecow');
var gonzales   = require('gonzales');
var gonzalesPe = require('gonzales-pe');

module.exports = {
    name:   'Bootstrap',
    maxTime: 15,
    tests: [
        {
            name: 'PostCSS',
            fn: function() {
                return postcss.parse(css).toResult().css;
            }
        },
        {
            name: 'Rework',
            fn: function() {
                return rework(css).toString();
            }
        },
        {
            name: 'CSSOM',
            fn: function() {
                return CSSOM.parse(css).toString();
            }
        },
        {
            name: 'Stylecow',
            fn: function() {
                return stylecow.create(css).toString();
            }
        },
        {
            name: 'Gonzales',
            fn: function() {
                return gonzales.csspToSrc( gonzales.srcToCSSP(css) );
            }
        },
        {
            name: 'Gonzales PE',
            fn: function() {
                return gonzalesPe.astToSrc({
                    ast: gonzalesPe.srcToAST({ src: css })
                });
            }
        }
    ]
};
