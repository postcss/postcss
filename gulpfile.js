var gutil    = require('gulp-util');
var gulp     = require('gulp');
var fs       = require('fs-extra');
var bench    = require('gulp-bench');
var combench = require('./tasks/compare-benchs.js');
var clean    = require('gulp-clean');
var argv     = require('optimist').argv;
var gulpif   = require('gulp-if');

gulp.task('clean', function (done) {
    fs.remove(__dirname + '/build', done);
});

gulp.task('build:lib', ['clean'], function () {
    var es6transpiler = require('gulp-es6-transpiler');

    return gulp.src('lib/*.js')
        .pipe(es6transpiler())
        .pipe(gulp.dest('build/lib'));
});

gulp.task('build:docs', ['clean'], function () {
    var ignore = require('fs').readFileSync('.npmignore').toString()
        .trim().split(/\n+/)
        .concat(['.npmignore', 'index.js', 'package.json'])
        .map(function (i) { return '!' + i; });

    return gulp.src(['*'].concat(ignore))
        .pipe(gulp.dest('build'));
});

gulp.task('build:package', ['clean'], function () {
    var editor = require('gulp-json-editor');

    gulp.src('./package.json')
        .pipe(editor(function (json) {
            json.main = 'lib/postcss';
            json.devDependencies['es6-transpiler'] =
                json.dependencies['es6-transpiler'];
            delete json.dependencies['es6-transpiler'];
            return json;
        }))
        .pipe(gulp.dest('build'));
});

gulp.task('build', ['build:lib', 'build:docs', 'build:package']);

gulp.task('lint:test', function () {
    var jshint = require('gulp-jshint');

    return gulp.src('test/*.js')
        .pipe(jshint({ esnext: true, expr: true }))
        .pipe(jshint.reporter('jshint-stylish'))
        .pipe(jshint.reporter('fail'));
});

gulp.task('lint:lib', function () {
    var jshint = require('gulp-jshint');

    return gulp.src(['lib/*.js', 'index.js', 'gulpfile.js'])
        .pipe(jshint({ esnext: true }))
        .pipe(jshint.reporter('jshint-stylish'))
        .pipe(jshint.reporter('fail'));
});

gulp.task('lint', ['lint:test', 'lint:lib']);

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

var styles = require('./tasks/styles');

function perf(src, comp) {
    return gulp.src(src)
        .pipe(bench({outputFormat: 'json', output: argv.name + '.json'}))
        .pipe(gulpif(comp, combench(['!benchmark/results/' + argv.name +
            '.json', 'benchmark/results/*.json'])))
        .pipe(gulp.dest('./benchmark/results'));
}

gulp.task('perf', ['build'], function() {
    return perf('./benchmark/*.js', true);
});

gulp.task('perf:general', ['build'], function() {
    return perf('./benchmark/general/*.js', false);
});

gulp.task('perf:clean', function() {
    return gulp.src('benchmark/results', { read: false })
        .pipe(clean());
});

gulp.task('integration', ['build'], function (done) {
    var postcss = require('./build/');
    var test = function (css, safe) {
        var processed;
        try {
            processed = postcss().process(css, {
                map: { annotation: false },
                safe:  safe
            }).css;
        } catch (e) {
            return 'Parsing error: ' + e.message + "\n\n" + e.stack;
        }

        if ( processed != css ) {
            return 'Output is not equal input';
        }
    };

    var links = [];
    var nextLink = function () {
        if ( links.length === 0 ) {
            nextSite();
            return;
        }

        var url = links.shift();
        get(url, function (css) {
            var error = test(css, url.indexOf('browserhacks.com') != -1);
            if ( error ) {
                done(new gutil.PluginError('integration', {
                    showStack: false,
                    message:   "\nFile " + url + "\n\n" + error
                }));
            } else {
                nextLink();
            }
        });
    };

    var sites = [{ name: 'GitHub',       url: 'https://github.com/' },
                 { name: 'Twitter',      url: 'https://twitter.com/' },
                 { name: 'Bootstrap',    url: 'http://getbootstrap.com/' },
                 { name: 'Habrahabr',    url: 'http://habrahabr.ru/' },
                 { name: 'Browserhacks', url: 'http://browserhacks.com/' }];
    var nextSite = function () {
        if ( sites.length === 0 ) {
            done();
            return;
        }
        var site = sites.shift();

        gutil.log('Test ' + site.name + ' styles');
        styles(site.url, function (styles) {
            links = styles;
            nextLink();
        });
    };

    nextSite();
});

gulp.task('test', function () {
    require('./');
    require('should');

    var mocha = require('gulp-mocha');
    return gulp.src('test/*.js', { read: false }).pipe(mocha());
});

gulp.task('default', ['lint', 'test', 'integration']);
