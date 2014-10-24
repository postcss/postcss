var gulp = require('gulp');
var fs   = require('fs-extra');

// Build

gulp.task('build:clean', function (done) {
    fs.remove(__dirname + '/build', done);
});

gulp.task('build:lib', ['build:clean'], function () {
    var es6to5 = require('gulp-6to5');

    return gulp.src('lib/*.js')
        .pipe(es6to5())
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
            json.devDependencies['6to5'] = json.dependencies['6to5'];
            delete json.dependencies['6to5'];
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
    fs.remove(__dirname + '/benchmark/results', function () {
        fs.remove(__dirname + '/benchmark/cache', done);
    });
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
    if ( fs.existsSync('./benchmark/cache/bootstrap.css') ) return done();

    var get = require('./tasks/get');
    get('github:twbs/bootstrap:dist/css/bootstrap.css', function (css) {
        fs.outputFile('./benchmark/cache/bootstrap.css', css, done);
    });
});

gulp.task('bench', ['build', 'bench:bootstrap'], function () {
    var bench   = require('gulp-bench');
    var summary = require('./tasks/summary');
    return gulp.src('./benchmark/general.js', { read: false })
        .pipe(bench())
        .pipe(summary);
});

// Tests

gulp.task('integration', ['build:lib'], function (done) {
    var gutil = require('gulp-util');
    var path  = require('path');

    var postcss = require('./build/lib/postcss');
    var styles  = require('./tasks/styles');

    var error = function (message) {
        done(new gutil.PluginError('integration', {
            showStack: false,
            message:   message
        }));
    };

    var sites = [
        { GitHub:       'https://github.com/' },
        { Twitter:      'https://twitter.com/' },
        { Bootstrap:    'github:twbs/bootstrap:dist/css/bootstrap.css' },
        { Habrahabr:    'http://habrahabr.ru/' },
        { Browserhacks: 'http://browserhacks.com/' }
    ];

    styles(sites, {
        site: function (name) {
            gutil.log('Test ' + name + ' styles');
        },
        css: function (css, url) {
            var processed;
            try {
                processed = postcss().process(css, {
                    map: { annotation: false },
                    safe:  url.match('browserhacks.com')
                }).css;
            } catch (e) {
                return error('Parsing error: ' + e.message + "\n\n" + e.stack);
            }

            if ( processed != css ) {
                fs.writeFileSync('origin.css', css);
                fs.writeFileSync('fail.css', processed);
                return error('Output is not equal input');
            }

            gutil.log('     ' + gutil.colors.green(path.basename(url)));
            return true;
        },
        done: done
    });
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
