/* Results on io.js 2.0, Fedora 21, Intel 5Y70, 8 GB RAM and SSD:

PostCSS:   36 ms
Rework:    77 ms   (2.1 times slower)
libsass:   136 ms  (3.8 times slower)
Less:      160 ms  (4.4 times slower)
Stylus:    167 ms  (4.6 times slower)
Stylecow:  208 ms  (5.7 times slower)
Ruby Sass: 1084 ms (30.1 times slower)
*/

var exec = require('child_process').exec;
var path = require('path');
var fs   = require('fs');

var example = path.join(__dirname, 'cache', 'bootstrap.css');
var css     = fs.readFileSync(example).toString();

css = css.replace(/\s+filter:[^;\}]+;?/g, '');
css = css.replace('/*# sourceMappingURL=bootstrap.css.map */', '');

// PostCSS
var postcss   = require('../build');
var processor = postcss([
    require('postcss-nested'),
    require('postcss-simple-vars'),
    require('postcss-calc')(),
    require('postcss-mixins')
]);
var pcss = css;
pcss += '$size: 100px;';
pcss += '@define-mixin icon { width: 16px; height: 16px; }';
for ( var i = 0; i < 100; i++ ) {
    pcss += 'body { h1 { a { color: black; } } }';
    pcss += 'h2 { width: $size; }';
    pcss += 'h1 { width: calc(2 * $size); }';
    pcss += '.search { fill: black; @mixin icon; }';
}

// Myth
var myth = require('myth');
var rcss = css;
rcss += ':root { --size: 100px; }';
for ( var i = 0; i < 100; i++ ) {
    rcss += 'body h1 a { color: black; }';
    rcss += 'h2 { width: var(--size); }';
    rcss += 'h1 { width: calc(2 * var(--size)); }';
    rcss += '.search { fill: black; width: 16px; height: 16px; }';
}

// Stylecow
var stylecow = require('stylecow');
stylecow.loadPlugin('variables').loadPlugin('nested-rules').loadPlugin('calc');
var cowcss = css;
cowcss += ':root { --size: 100px; }';
for ( var i = 0; i < 100; i++ ) {
    cowcss += 'body { h1 { a { color: black; } } }';
    cowcss += 'h2 { width: var(--size); }';
    cowcss += 'h1 { width: calc(2 * var(--size)); }';
    cowcss += '.search { fill: black; width: 16px; height: 16px; }';
}

// Sass
var libsass = require('node-sass');
var scss = css;
scss += '$size: 100px;';
scss += '@mixin icon { width: 16px; height: 16px; }';
for ( var i = 0; i < 100; i++ ) {
    scss += 'body { h1 { a { color: black; } } }';
    scss += 'h2 { width: $size; }';
    scss += 'h1 { width: 2 * $size; }';
    scss += '.search { fill: black; @include icon; }';
}
var scssFile = path.join(__dirname, 'cache', 'bootstrap.scss');
fs.writeFileSync(scssFile, scss);

// Stylus
var stylus = require('stylus');
var styl = css;
styl += 'size = 100px;';
styl += 'icon() { width: 16px; height: 16px; }';
for ( var i = 0; i < 100; i++ ) {
    styl += 'body { h1 { a { color: black; } } }';
    styl += 'h2 { width: size; }';
    styl += 'h1 { width: 2 * size; }';
    styl += '.search { fill: black; icon(); }';
}

// Less
var less = require('less');
var lcss = css;
lcss += '@size: 100px;';
lcss += '.icon() { width: 16px; height: 16px; }';
for ( var i = 0; i < 100; i++ ) {
    lcss += 'body { h1 { a { color: black; } } }';
    lcss += 'h2 { width: @size; }';
    lcss += 'h1 { width: 2 * @size; }';
    lcss += '.search { fill: black; .icon() }';
}

module.exports = {
    name:   'Bootstrap',
    maxTime: 15,
    tests: [
        {
            name: 'libsass',
            fn: function () {
                libsass.renderSync({ data: scss });
            }
        },
        {
            name: 'Rework',
            defer: true,
            fn: function (done) {
                myth(rcss, { features: { prefixes: false } });
                done.resolve();
            }
        },
        {
            name: 'PostCSS',
            defer: true,
            fn: function (done) {
                processor.process(pcss, { map: false }).then(function () {
                    done.resolve();
                });
            }
        },
        {
            name: 'Stylecow',
            defer: true,
            fn: function (done) {
                var file = new stylecow.Reader(new stylecow.Tokens(cowcss));
                var ast  = stylecow.Root.create(file);
                stylecow.run(ast);
                ast.toString();
                done.resolve();
            }
        },
        {
            name: 'Stylus',
            defer: true,
            fn: function (done) {
                stylus.render(styl, { filename: example }, function (err) {
                    if ( err ) throw err;
                    done.resolve();
                });
            }
        },
        {
            name: 'Less',
            defer: true,
            fn: function (done) {
                less.render(lcss, function (err) {
                    if ( err ) throw err;
                    done.resolve();
                });
            }
        },
        {
            name: 'Ruby Sass',
            defer: true,
            fn: function (done) {
                var command = 'sass -C --sourcemap=none ' + scssFile;
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
