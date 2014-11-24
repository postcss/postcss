var fs   = require('fs');
var exec = require('child_process').exec;

var path = __dirname + '/cache/bootstrap.css';
var css  = fs.readFileSync(path).toString();

css = css.replace(/\s+filter:[^;\}]+;?/g, '');
css = css.replace('/*# sourceMappingURL=bootstrap.css.map */', '');
var scss = __dirname + '/cache/bootstrap.scss';
fs.writeFileSync(scss, css);

var postcss = require('../build');
var cssnext = require('cssnext');
var stylus  = require('stylus');
var sass    = require('node-sass');
var less    = require('less');

module.exports = {
    name:   'Bootstrap',
    maxTime: 15,
    tests: [
        {
            name: 'PostCSS',
            fn: function (done) {
                return postcss(cssnext).process(css, { map: false }).css;
            }
        },
        {
            name: 'Stylus',
            defer: true,
            fn: function (done) {
                stylus.render(css, { filename: path }, function (err, css) {
                    if ( err ) throw err;
                    done.resolve();
                });
            }
        },
        {
            name: 'Less',
            defer: true,
            fn: function (done) {
                less.render(css, function (err, css) {
                    if ( err ) throw err;
                    done.resolve();
                });
            }
        },
        {
            name: 'libsass',
            fn: function () {
                return sass.renderSync({ data: css });
            }
        },
        {
            name: 'Ruby Sass',
            defer: true,
            fn: function (done) {
                var command = 'sass -C --sourcemap=none ' + scss;
                exec('cd ' + __dirname + '; bundle exec ' + command,
                     function (error, stdout, stderr) {
                        if ( error ) throw stderr;
                        done.resolve();
                     });
            }
        }
    ]
};
