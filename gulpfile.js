var gutil = require('gulp-util');
var gulp  = require('gulp');

// Build

gulp.task('build:clean', function (done) {
    require('del')(['./build'], done);
});

gulp.task('build:lib', ['build:clean'], function () {
    var es6transpiler = require('gulp-es6-transpiler');

    return gulp.src('lib/*.js')
        .pipe(es6transpiler())
        .pipe(gulp.dest('build/lib'));
});

gulp.task('build:docs', ['build:clean'], function () {
    var ignore = require('fs').readFileSync('.npmignore').toString()
        .trim().split(/\n+/)
        .concat(['.npmignore', 'index.js', 'package.json'])
        .map(function (i) { return '!' + i; });

    return gulp.src(['*'].concat(ignore))
        .pipe(gulp.dest('build'));
});

gulp.task('build:package', ['build:clean'], function () {
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

// Lint

gulp.task('lint:test', function () {
    var jshint = require('gulp-jshint');

    return gulp.src('test/*.js')
        .pipe(jshint({ esnext: true, expr: true }))
        .pipe(jshint.reporter('jshint-stylish'))
        .pipe(jshint.reporter('fail'));
});

gulp.task('lint:lib', function () {
    var jshint = require('gulp-jshint');

    return gulp.src(['lib/*.js', 'tasks/*.js', 'benchmark/**/*.js', '*.js'])
        .pipe(jshint({ esnext: true }))
        .pipe(jshint.reporter('jshint-stylish'))
        .pipe(jshint.reporter('fail'));
});

gulp.task('lint', ['lint:test', 'lint:lib']);

// Benchmark

gulp.task('bench:clean', function (done) {
    require('del')(['./benchmark/results', './benchmark/cache'], done);
});

['tokenizer', 'parser'].forEach(function (type) {
    gulp.task('bench:' + type, ['build:lib'], function() {
        var compare = require('./tasks/compare');
        var bench   = require('gulp-bench');
        var sh      = require('execSync');

        var status = sh.exec('git status --porcelain').stdout.trim();
        var name   = status === '' ? 'master' : 'current';

        return gulp.src('./benchmark/' + type + '.js', { read: false })
            .pipe(bench({ outputFormat: 'json', output: name + '.json' }))
            .pipe(compare(name))
            .pipe(gulp.dest('./benchmark/results'));
    });
});

gulp.task('bench:bootstrap', function (done) {
    var fs = require('fs');
    if ( fs.existsSync('./benchmark/cache/bootstrap.css') ) return done();

    var html = require('./tasks/html');
    fs.mkdirSync('./benchmark/cache/');
    html.get('github:twbs/bootstrap:dist/css/bootstrap.css', function (css) {
        fs.writeFile('./benchmark/cache/bootstrap.css', css, done);
    });
});

gulp.task('bench', ['build', 'bench:bootstrap'], function () {
    var bench = require('gulp-bench');
    return gulp.src('./benchmark/general/*.js', { read: false }).pipe(bench());
});

// Tests

gulp.task('integration', ['build:lib'], function (done) {
    var postcss = require('./build/lib/postcss');
    var html    = require('./tasks/html');

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
            var fs = require('fs');
            fs.writeFileSync('origin.css', css);
            fs.writeFileSync('fail.css', processed);
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
        html.get(url, function (css) {
            var error = test(css, url.match('browserhacks.com'));
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

    var sites = [
        { GitHub:       'https://github.com/' },
        { Twitter:      'https://twitter.com/' },
        { Bootstrap:    'github:twbs/bootstrap:dist/css/bootstrap.css' },
        { Habrahabr:    'http://habrahabr.ru/' },
        { Browserhacks: 'http://browserhacks.com/' }
    ];
    var nextSite = function () {
        if ( sites.length === 0 ) {
            done();
            return;
        }
        var site = sites.shift();
        var name = Object.keys(site)[0];
        gutil.log('Test ' + name + ' styles');

        html.styles(site[name], function (files) {
            links = files;
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

// Common

gulp.task('clean', ['build:clean', 'bench:clean']);

gulp.task('default', ['lint', 'test', 'integration']);
