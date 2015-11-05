import gulp from 'gulp';
import { task } from 'gulp-shell';

gulp.task('clean', () => {
    let del = require('del');
    return del(['postcss.js', 'build/', 'coverage/']);
});

// Build

gulp.task('build:lib', ['clean'], task('rollup -c'));

gulp.task('build:docs', ['clean'], () => {
    let ignore = require('fs').readFileSync('.npmignore').toString()
        .trim().split(/\n+/)
        .concat(['.npmignore', 'index.js', 'package.json',
                 'lib/*', 'test/*', 'node_modules/**/*'])
        .map( i => '!' + i );
    return gulp.src(['**/*'].concat(ignore))
        .pipe(gulp.dest('build'));
});

gulp.task('build:package', ['clean'], () => {
    let editor = require('gulp-json-editor');
    return gulp.src('./package.json')
        .pipe(editor( (p) => {
            p.main = 'lib/postcss';
            p.devDependencies['babel-core'] = p.dependencies['babel-core'];
            delete p.dependencies['babel-core'];
            return p;
        }))
        .pipe(gulp.dest('build'));
});

gulp.task('build', ['build:lib', 'build:docs', 'build:package']);

// Lint

gulp.task('lint', () => {
    let eslint = require('gulp-eslint');
    return gulp.src(['*.js', 'lib/*.js', 'test/*.es6'])
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

gulp.task('test', () => {
    require('./');
    let mocha = require('gulp-mocha');
    return gulp.src('test/*.es6', { read: false }).pipe(mocha());
});

gulp.task('integration', ['build:lib', 'build:package'], (done) => {
    let postcss = require('./build/lib/postcss');
    let real    = require('postcss-parser-tests/real');
    real(done, (css) => {
        return postcss.parse(css).toResult({ map: { annotation: false } });
    });
});

// Coverage

gulp.task('coverage:instrument', () => {
    require('./');
    let istanbul = require('gulp-istanbul');
    let isparta  = require('isparta');
    return gulp.src('lib/*.js')
        .pipe(istanbul({
            includeUntested: true,
            instrumenter:    isparta.Instrumenter
        }))
        .pipe(istanbul.hookRequire());
});

gulp.task('coverage:report', () => {
    let istanbul = require('gulp-istanbul');
    return gulp.src('test/*.es6', { read: false })
        .pipe(istanbul.writeReports())
        .pipe(istanbul.enforceThresholds({
            thresholds: {
                global: {
                    statements: 89.12,
                    functions:  87.29,
                    branches:   81.85,
                    lines:      90.68
                }
            }
        }));
});

gulp.task('coverage', (done) => {
    let runSequence = require('run-sequence');
    runSequence('coverage:instrument', 'test', 'coverage:report', done);
});

// Common

gulp.task('default', ['lint', 'spellcheck', 'coverage']);
