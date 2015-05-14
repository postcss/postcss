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
        .pipe(editor(function (p) {
            p.main = 'lib/postcss';
            p.devDependencies['babel-core'] = p.dependencies['babel-core'];
            delete p.dependencies['babel-core'];
            return p;
        }))
        .pipe(gulp.dest('build'));
});

gulp.task('build', ['build:lib', 'build:docs', 'build:package']);

// Lint

gulp.task('lint', function () {
    var eslint = require('gulp-eslint');

    return gulp.src(['*.js', 'lib/*.js', 'test/*.js', 'benchmark/**/*.js'])
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failAfterError());
});

gulp.task('spellcheck', function (done) {
    var gutil = require('gulp-util');
    var run   = require('gulp-run');

    run('yaspeller .').exec()
        .on('error', function (err) {
            done(new gutil.PluginError('spellcheck', {
                showStack: false,
                message:   err.message
            }));
        })
        .on('finish', done);
});

// Benchmark

gulp.task('bench:clean', function (done) {
    fs.remove(path.join(__dirname, '/benchmark/results'), function () {
        fs.remove(path.join(__dirname, '/benchmark/cache'), done);
    });
});

['tokenizer', 'parser'].forEach(function (type) {
    gulp.task('bench:' + type, ['build:lib'], function() {
        var compare = require('./benchmark/compare');
        var bench   = require('gulp-bench');
        var child   = require('child_process');

        var status = child.execSync('git status --porcelain').toString().trim();
        var name   = status === '' ? 'master' : 'current';

        return gulp.src('./benchmark/' + type + '.js', { read: false })
            .pipe(bench({ outputFormat: 'json', output: name + '.json' }))
            .pipe(compare(name))
            .pipe(gulp.dest('./benchmark/results'));
    });
});

gulp.task('bench:bootstrap', function (done) {
    if ( fs.existsSync('./benchmark/cache/bootstrap.css') ) return done();

    var load = require('load-resources');
    load('github:twbs/bootstrap:dist/css/bootstrap.css', '.css', function (f) {
        fs.outputFile('./benchmark/cache/bootstrap.css', f, done);
    });
});

gulp.task('bench', ['build', 'bench:bootstrap'], function () {
    var bench   = require('gulp-bench');
    var summary = require('gulp-bench-summary');
    return gulp.src('./benchmark/general.js', { read: false })
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
    var load  = require('load-resources');

    var postcss = require('./build/lib/postcss');

    var error = function (url, message) {
        gutil.log(gutil.colors.red('Fail on ' + url));
        done(new gutil.PluginError('integration', {
            showStack: false,
            message:   message
        }));
    };

    var sites = {
        GitHub:       'https://github.com/',
        Twitter:      'https://twitter.com/',
        Bootstrap:    'github:twbs/bootstrap:dist/css/bootstrap.css',
        Habrahabr:    'http://habrahabr.ru/',
        Browserhacks: 'http://browserhacks.com/'
    };
    var urls = Object.keys(sites).map(function (i) {
        return sites[i];
    });

    var lastDomain = false;
    var siteIndex  = -1;

    load(urls, '.css', function (css, url, last) {
        postcss().process(css, {
            map: { annotation: false },
            safe:  url.match('browserhacks.com')

        }).catch(function (e) {
            fs.writeFileSync('fail.css', css);
            return error(url, 'Parsing error: ' + e.message + e.stack);

        }).then(function (result) {
            if ( !result ) return;

            if ( result.css !== css ) {
                fs.writeFileSync('origin.css', css);
                fs.writeFileSync('fail.css', result.css);
                error(url, 'Output is not equal input');
                return;
            }

            var domain = url.match(/https?:\/\/[^\/]+/)[0];
            if ( domain !== lastDomain ) {
                lastDomain = domain;
                siteIndex += 1;
                gutil.log('Test ' + Object.keys(sites)[siteIndex] + ' styles');
            }
            gutil.log('     ' + gutil.colors.green(path.basename(url)));

            if ( last ) done();
        }).catch(done);
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

gulp.task('default', ['lint', 'spellcheck', 'test', 'integration']);
