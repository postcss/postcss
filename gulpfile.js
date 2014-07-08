var gulp = require('gulp');

gulp.task('clean', function () {
    var rimraf = require('gulp-rimraf');

    return gulp.src('build', { read: false })
        .pipe(rimraf());
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

