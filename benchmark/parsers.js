/* Results on Fedora 21, Intel 5Y70, 8 GB RAM and SSD:

PostCSS:     37 ms
CSSOM:       38 ms  (1.0 times slower)
Mensch:      39 ms  (1.0 times slower)
Rework:      67 ms  (1.8 times slower)
Stylecow:    120 ms (3.2 times slower)
Gonzales:    173 ms (4.6 times slower)
Gonzales PE: 935 ms (25.0 times slower)
*/

var path = require('path');
var fs   = require('fs');

var example = path.join(__dirname, 'cache', 'bootstrap.css');
var css     = fs.readFileSync(example).toString();

var CSSOM      = require('cssom');
var rework     = require('rework');
var mensch     = require('mensch');
var postcss    = require('../build');
var stylecow   = require('stylecow-parser');
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
            defer: true,
            fn: function (done) {
                postcss.parse(css, { from: example }).toResult();
                done.resolve();
            }
        },
        {
            name: 'CSSOM',
            fn: function () {
                CSSOM.parse(css).toString();
            }
        },
        {
            name: 'Mensch',
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
                gonzalesPe.parse(css).toString();
            }
        },
        {
            name: 'Stylecow',
            fn: function () {
                var file = new stylecow.Reader(new stylecow.Tokens(css));
                stylecow.Root.create(file).toString();
            }
        }
    ]
};
