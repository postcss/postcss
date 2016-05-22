import gulp from 'gulp';

gulp.task('clean', () => {
    let del = require('del');
    return del(['lib/*.js', 'postcss.js', 'build/', 'api/']);
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
    return gulp.src(['*.js', 'lib/*.es6', 'test/*.js'])
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
    let ava = require('gulp-ava');
    return gulp.src('test/*.js', { read: false }).pipe(ava());
});

gulp.task('integration', ['build:lib'], done => {
    let postcss = require('./build/lib/postcss');
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

gulp.task('api', done => {
    let jsdoc = require('gulp-jsdoc3');
    gulp.src('lib/*.es6', { read: false })
        .pipe(jsdoc({
            source: {
                includePattern: '.+\\.es6$'
            },
            opts: {
                destination: './api/'
            }
        }, done));
});

// Common

gulp.task('offline', ['version', 'lint', 'test', 'api']);

gulp.task('default', ['offline', 'spellcheck', 'integration']);
