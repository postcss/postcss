var gulp = require('gulp');

gulp.task('clean', function () {
    var fs = require('fs-extra');
    fs.removeSync(__dirname + '/build');
    fs.removeSync(__dirname + '/fail.css');
    fs.removeSync(__dirname + '/origin.css');
});

gulp.task('build:lib', function () {
    var traceur = require('gulp-traceur');

    return gulp.src('lib/*.js')
        .pipe(traceur())
        .pipe(gulp.dest('build/lib'));
});

gulp.task('build:docs', function () {
    var ignore = require('fs').readFileSync('.npmignore').toString()
        .trim().split(/\n+/)
        .concat(['.npmignore', 'package.json', 'index.js'])
        .map(function (i) { return '!' + i; });

    return gulp.src(['*'].concat(ignore))
        .pipe(gulp.dest('build'));
});

gulp.task('build:package', function () {
    var editor = require('gulp-json-editor');

    return gulp.src('package.json')
        .pipe(editor(function (json) {
            json.main = 'lib/postcss';
            json.devDependencies.traceur = json.dependencies.traceur;
            delete json.dependencies.traceur;
            return json;
        }))
        .pipe(gulp.dest('build'));
});

gulp.task('build', ['clean', 'build:lib', 'build:docs', 'build:package']);

gulp.task('lint:test', function () {
    var jshint = require('gulp-jshint');

    return gulp.src('test/*.js')
        .pipe(jshint({ esnext: true, expr: true }))
        .pipe(jshint.reporter('jshint-stylish'));
});

gulp.task('lint:lib', function () {
    var jshint = require('gulp-jshint');

    return gulp.src(['lib/*.js', 'index.js', 'gulpfile.js'])
        .pipe(jshint({ esnext: true }))
        .pipe(jshint.reporter('jshint-stylish'));
});

gulp.task('lint', ['lint:test', 'lint:lib']);

var print = function (text) {
    process.stdout.write(text);
};

var error = function (text) {
    process.stderr.write("\n\n" + text + "\n");
    process.exit(1);
};

var zlib, request;
var get = function (url, callback) {
    if ( !zlib ) {
        zlib    = require('zlib');
        request = require('request');
    }

    request.get({ url: url, headers: { 'accept-encoding': 'gzip,deflate' } })
        .on('response', function (res) {
            var chunks = [];
            res.on('data', function (i) {
                chunks.push(i);
            });
            res.on('end', function () {
                var buffer = Buffer.concat(chunks);

                if ( res.headers['content-encoding'] == 'gzip' ) {
                    zlib.gunzip(buffer, function (err, decoded) {
                        callback(decoded.toString());
                    });

                } else if ( res.headers['content-encoding'] == 'deflate' ) {
                    zlib.inflate(buffer, function (err, decoded) {
                        callback(decoded.toString());
                    });

                } else {
                    callback(buffer.toString());
                }
            });
        });
};

var styles = function (url, callback) {
    get(url, function (html) {
        var styles = html.match(/[^"]+\.css/g);
        if ( !styles ) error('Wrong answer from ' + url);
        styles = styles.map(function(i) {
            return i.replace(/^\.?\.?\//, url);
        });
        callback(styles);
    });
};

gulp.task('bench', ['build'], function (done) {
    var indent = function (max, current) {
        var diff = max.toString().length - current.toString().length;
        for ( var i = 0; i < diff; i++ ) {
            print(' ');
        }
    };

    var times = { };
    var bench = function (title, callback) {
        print(title + ': ');
        indent('Gonzales', title);

        var start = new Date();

        for ( var i = 0; i < 10; i++ ) callback();

        time = (new Date()) - start;
        time = Math.round(time / 10);
        print(time + " ms");

        if ( times.PostCSS ) {
            var slower = time / times.PostCSS;
            if ( time < 100 ) print(' ');
            if ( slower < 1 ) {
                print(' (' + (1 / slower).toFixed(1) + ' times faster)');
            } else {
                print(' (' + slower.toFixed(1) + ' times slower)');
            }
        }
        times[title] = time;
        print("\n");
    };

    styles('https://github.com/', function (styles) {
        print("\nLoad Github style")
        get(styles[0], function (css) {
            print("\n");

            var postcss = require(__dirname + '/build');
            bench('PostCSS', function () {
                return postcss().process(css).css;
            });

            var CSSOM = require('cssom');
            bench('CSSOM', function () {
                return CSSOM.parse(css).toString();
            });

            var rework = require('rework');
            bench('Rework', function () {
                return rework(css).toString();
            });

            var gonzales = require('gonzales');
            bench('Gonzales', function () {
                return gonzales.csspToSrc( gonzales.srcToCSSP(css) );
            });

            print("\n");
            done();
        });
    });
});

gulp.task('integration', function (done) {
    var postcss = require('./');
    var test = function (css) {
        var processed;
        try {
            processed = postcss().process(css, {
                map: { annotation: false }
            }).css;
        } catch (e) {
            fs.writeFileSync(__dirname + '/fail.css', css);
            error('Parsing error: ' + e.stack + "\n" +
                  'Bad file was saved to fail.css');
        }

        if ( processed != css ) {
            fs.writeFileSync(__dirname + '/origin.css', css);
            fs.writeFileSync(__dirname + '/fail.css', processed);
            error("Wrong stringifing\n" +
                  "Check difference between origin.css and fail.css");
        }
    };

    var links = [];
    var nextLink = function () {
        if ( links.length === 0 ) {
            print("\n");
            nextSite();
            return;
        }

        var url = links.shift();
        if ( url.indexOf('&quot;') != -1 ) {
            nextLink();
            return;
        }

        get(url, function (css) {
            test(css);
            print('.');
            nextLink();
        });
    };

    var sites = [{ name: 'GitHub',    url: 'https://github.com/' },
                 { name: 'Twitter',   url: 'https://twitter.com/' },
                 { name: 'Bootstrap', url: 'http://getbootstrap.com/' },
                 { name: 'Habrahabr', url: 'http://habrahabr.ru/' }];
    var nextSite = function () {
        if ( sites.length === 0 ) {
            print("\n");
            done();
            return;
        }
        var site = sites.shift();

        print('Test ' + site.name + ' styles');
        styles(site.url, function (styles) {
            links = styles;
            nextLink();
        });
    };

    print("\n");
    nextSite();
});
