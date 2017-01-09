import gulp from 'gulp';

gulp.task('clean', () => {
    let del = require('del');
    return del(['lib/*.js', 'postcss.js', 'build/', 'api/']);
});

// Build

if ( parseInt(process.versions.node) < 4 ) {
    gulp.task('compile', () => {
        let babel = require('gulp-babel');
        return gulp.src('lib/*.es6')
            .pipe(babel())
            .pipe(gulp.dest('lib'));
    });
} else {
    gulp.task('compile', () => {
        let sourcemaps = require('gulp-sourcemaps');
        let changed    = require('gulp-changed');
        let babel      = require('gulp-babel');
        return gulp.src('lib/*.es6')
            .pipe(changed('lib', { extension: '.js' }))
            .pipe(sourcemaps.init())
            .pipe(babel())
            .pipe(sourcemaps.write())
            .pipe(gulp.dest('lib'));
    });
}

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

// Lint

gulp.task('lint', () => {
    if ( parseInt(process.versions.node) < 4 ) {
        return false;
    }
    let eslint = require('gulp-eslint');
    return gulp.src(['*.js', 'lib/*.es6', 'test/*.js'])
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failAfterError());
});

gulp.task('spellcheck', ['api'], () => {
    if ( parseInt(process.versions.node) < 4 ) {
        return false;
    }
    let run = require('gulp-run');
    return gulp.src(
        ['api/*.html', '!api/*.es6.html', '*.md', 'docs/**/*.md'],
        { read: false }
    ).pipe(run('yaspeller <%= file.path %>'));
});

// Tests

gulp.task('test', ['compile'], () => {
    let ava = require('gulp-ava');
    return gulp.src('test/*.js', { read: false }).pipe(ava());
});

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

gulp.task('offline', ['version', 'lint', 'test', 'api']);

gulp.task('default', ['offline', 'spellcheck', 'integration']);
