import gulp from 'gulp';

gulp.task('clean', () => {
    let del = require('del');
    return del(['lib/*.js', 'postcss.js', 'build/', 'coverage/']);
});

// Build

gulp.task('compile', ['clean'], () => {
    let sourcemaps = require('gulp-sourcemaps');
    let babel      = require('gulp-babel');
    return gulp.src('lib/*.es6')
        .pipe(sourcemaps.init())
        .pipe(babel())
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('lib'));
});

gulp.task('build:lib', ['compile'], () => {
    return gulp.src('lib/*.js').pipe(gulp.dest('build/lib'));
});

gulp.task('build:docs', ['clean'], () => {
    let ignore = require('fs').readFileSync('.npmignore').toString()
        .trim().split(/\n+/)
        .concat(['.npmignore', 'index.js', 'lib/*', 'test/*',
                 'node_modules/**/*'])
        .map( i => '!' + i );
    return gulp.src(['**/*'].concat(ignore))
        .pipe(gulp.dest('build'));
});

gulp.task('build', ['build:lib', 'build:docs']);

// Lint

gulp.task('lint', () => {
    let eslint = require('gulp-eslint');
    return gulp.src(['*.js', 'lib/*.es6', 'test/*.es6'])
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failAfterError());
});

gulp.task('spellcheck', () => {
    let shell = require('gulp-shell');
    return gulp.src(['*.md', 'docs/**/*.md'], { read: false })
        .pipe(shell('yaspeller <%= file.path %>'));
});

// Tests

gulp.task('test', ['compile'], () => {
    let mocha = require('gulp-mocha');
    return gulp.src('test/*.es6', { read: false }).pipe(mocha());
});

gulp.task('integration', ['build:lib'], done => {
    let postcss = require('./build/lib/postcss');
    let real    = require('postcss-parser-tests/real');
    real(done, css => {
        return postcss.parse(css).toResult({ map: { annotation: false } });
    });
});

// Common

gulp.task('default', ['lint', 'spellcheck', 'test', 'integration']);
