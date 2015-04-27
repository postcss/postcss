/* Results on Intel 5Y70 and 8 GB RAM:

PostCSS:   32 ms
Rework:    62 ms  (2.0 times slower)
libsass:   94 ms  (3.0 times slower)
Less:      117 ms (3.7 times slower)
Stylus:    150 ms (4.7 times slower)
Ruby Sass: 963 ms (30.5 times slower)
*/

var exec = require('child_process').exec;
var path = require('path');
var fs   = require('fs');

var example = path.join(__dirname, 'cache', 'bootstrap.css');
var css     = fs.readFileSync(example).toString();

css = css.replace(/\s+filter:[^;\}]+;?/g, '');
css = css.replace('/*# sourceMappingURL=bootstrap.css.map */', '');
var scss = path.join(__dirname, 'cache', 'bootstrap.scss');
fs.writeFileSync(scss, css);

var postcss = require('../build');
var cssnext = require('cssnext');
var stylus  = require('stylus');
var less    = require('less');
var myth    = require('myth');

try {
    var sass = require('node-sass');
} catch (e) {
    console.error(e.toString());
}

module.exports = {
    name:   'Bootstrap',
    maxTime: 15,
    tests: [
        {
            name: 'PostCSS',
            defer: true,
            fn: function (done) {
                postcss(cssnext).process(css, { map: false }).then(function () {
                    done.resolve();
                });
            }
        },
        {
            name: 'Rework',
            defer: true,
            fn: function (done) {
                myth(css, { features: { prefixes: false } });
                done.resolve();
            }
        },
        {
            name: 'Stylus',
            defer: true,
            fn: function (done) {
                stylus.render(css, { filename: example }, function (err) {
                    if ( err ) throw err;
                    done.resolve();
                });
            }
        },
        {
            name: 'Less',
            defer: true,
            fn: function (done) {
                less.render(css, function (err) {
                    if ( err ) throw err;
                    done.resolve();
                });
            }
        },
        {
            name: 'libsass',
            fn: function () {
                sass.renderSync({ data: css });
            }
        },
        {
            name: 'Ruby Sass',
            defer: true,
            fn: function (done) {
                var command = 'sass -C --sourcemap=none ' + scss;
                var dir = __dirname;
                exec('cd ' + dir + '; bundle exec ' + command,
                    function (error, stdout, stderr) {
                        if ( error ) throw stderr;
                        done.resolve();
                    });
            }
        }
    ]
};
