var gulp = require('gulp');
var path = require('path');
var fs   = require('fs-extra');

// Build

gulp.task('build:clean', function (done) {
    fs.remove(path.join(__dirname, 'postcss.js'), function () {
        fs.remove(path.join(__dirname, 'build'), done);
    });
});

gulp.task('build:lib', ['build:clean'], function () {
    var babel = require('gulp-babel');

    return gulp.src('lib/*.js')
        .pipe(babel({ loose: 'all' }))
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
            json.devDependencies.babel = json.dependencies.babel;
            delete json.dependencies.babel;
            return json;
        }))
        .pipe(gulp.dest('build'));
});

gulp.task('build', ['build:lib', 'build:docs', 'build:package']);

gulp.task('standalone', ['build'], function (done) {
    var builder = require('browserify')({
        basedir:     path.join(__dirname, 'build'),
        standalone: 'postcss'
    });
    builder.add('./lib/postcss.js');

    builder.bundle(function (error, build) {
        if ( error ) throw error.toString();
        fs.removeSync(path.join(__dirname, 'build'));
        fs.writeFile(path.join(__dirname, 'postcss.js'), build, done);
    });
});

// Lint

gulp.task('lint', function () {
    var eslint = require('gulp-eslint');

    return gulp.src(['*.js',
                     'lib/*.js',
                     'test/*.js',
                     'tasks/*.js',
                     'benchmark/**/*.js'])
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failAfterError());
});


// Benchmark

gulp.task('bench:clean', function (done) {
    fs.remove(path.join(__dirname, '/benchmark/results'), function () {
        fs.remove(path.join(__dirname, '/benchmark/cache'), done);
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

gulp.task('bench:processors', ['build', 'bench:bootstrap'], function () {
    var bench   = require('gulp-bench');
    var summary = require('gulp-bench-summary');
    return gulp.src('./benchmark/processors.js', { read: false })
        .pipe(bench())
        .pipe(summary('PostCSS'));
});

gulp.task('bench:parsers', ['build', 'bench:bootstrap'], function () {
    var bench   = require('gulp-bench');
    var summary = require('gulp-bench-summary');
    return gulp.src('./benchmark/parsers.js', { read: false })
        .pipe(bench())
        .pipe(summary('PostCSS'));
});

// Tests

gulp.task('integration', ['build:lib', 'build:package'], function (done) {
    var gutil = require('gulp-util');

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
                fs.writeFileSync('fail.css', css);
                return error('Parsing error: ' + e.message + e.stack);
            }

            if ( processed !== css ) {
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
    var mocha = require('gulp-mocha');
    return gulp.src('test/*.js', { read: false }).pipe(mocha());
});

// Helpers

gulp.task('cases', function () {
    var postcss = require('./');
    var cases   = path.join(__dirname, 'test', 'cases');

    fs.readdirSync(cases).forEach(function (name) {
        if ( !name.match(/\.css$/) ) return;
        var css  = fs.readFileSync(path.join(cases, name));
        var root = postcss.parse(css, { from: '/' + name });
        var json = JSON.stringify(root, null, 4);
        var file = path.join(cases, name.replace(/\.css$/, '.json'));
        fs.writeFileSync(file, json + '\n');
    });
});

// Common

gulp.task('clean', ['build:clean', 'bench:clean']);

gulp.task('default', ['lint', 'test', 'integration']);
