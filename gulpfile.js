'use strict';

const gulp = require('gulp');

gulp.task('clean', () => {
    let del = require('del');
    return del(['lib/*.js', 'postcss.js', 'build/', 'api/']);
});

// Build

gulp.task('compile', () => {
    let sourcemaps = require('gulp-sourcemaps');
    let changed    = require('gulp-changed');
    let babel      = require('gulp-babel');
    return gulp.src('lib/*.es6')
        .pipe(changed('lib', { extension: '.js' }))
        .pipe(sourcemaps.init())
        .pipe(babel({
            presets: [
                [
                    'env',
                    {
                        targets: {
                            browsers: 'last 1 version',
                            node: 4
                        },
                        loose: true
                    }
                ]
            ],
            plugins: ['add-module-exports', 'precompile-charcodes']
        }))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('lib'));
});

gulp.task('build:lib', ['compile'], () => {
    return gulp.src(['lib/*.js', 'lib/*.d.ts']).pipe(gulp.dest('build/lib'));
});

gulp.task('build:docs', () => {
    let ignore = require('fs').readFileSync('.npmignore').toString()
        .trim().split(/\n+/)
        .concat([
            '.npmignore', 'lib/*', 'test/*', 'node_modules/**/*',
            'docs/api.md', 'docs/plugins.md', 'docs/writing-a-plugin.md'
        ]).map( i => '!' + i );
    return gulp.src(['**/*'].concat(ignore))
        .pipe(gulp.dest('build'));
});

gulp.task('build', (done) => {
    let runSequence = require('run-sequence');
    runSequence('clean', ['build:lib', 'build:docs'], done);
});

// Tests

gulp.task('integration', ['build'], done => {
    let postcss = require('./build');
    let real    = require('postcss-parser-tests/real');
    real(done, css => {
        return postcss.parse(css).toResult({ map: { annotation: false } });
    });
});

gulp.task('version', ['build:lib'], () => {
    let Processor = require('./lib/processor');
    let instance  = new Processor();
    let pkg       = require('./package');
    if ( pkg.version !== instance.version ) {
        throw new Error('Version in Processor is not equal to package.json');
    }
});

// Docs

gulp.task('api', ['clean'], () => {
    if ( /^win/.test(process.platform) ) return false;
    let run = require('gulp-run');
    return run('jsdoc -c .jsdocrc lib/*.es6').exec();
});

// Common

gulp.task('default', ['version', 'api', 'integration']);
