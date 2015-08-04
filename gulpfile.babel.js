import gulp from 'gulp';
import path from 'path';
import fs   from 'fs-extra';

gulp.task('clean', (done) => {
    fs.remove(path.join(__dirname, 'postcss.js'), () => {
        fs.remove(path.join(__dirname, 'build'), done);
    });
});

// Build

gulp.task('build:lib', ['clean'], () => {
    let babel = require('gulp-babel');
    return gulp.src('lib/*.es6')
        .pipe(babel())
        .pipe(gulp.dest('build/lib'));
});

gulp.task('build:docs', ['clean'], () => {
    let ignore = require('fs').readFileSync('.npmignore').toString()
        .trim().split(/\n+/)
        .concat(['.npmignore', 'index.js', 'package.json'])
        .map( i => '!' + i );
    return gulp.src(['*'].concat(ignore))
        .pipe(gulp.dest('build'));
});

gulp.task('build:package', ['clean'], () => {
    let editor = require('gulp-json-editor');
    gulp.src('./package.json')
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
    return gulp.src(['*.js', 'lib/*.es6', 'test/*.es6'])
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failAfterError());
});

gulp.task('spellcheck', (done) => {
    let gutil = require('gulp-util');
    let run   = require('gulp-run');
    run('yaspeller .').exec()
        .on('error', (err) => {
            done(new gutil.PluginError('spellcheck', {
                showStack: false,
                message:   err.message
            }));
        })
        .on('finish', done);
});

// Tests

gulp.task('integration', ['build:lib', 'build:package'], (done) => {
    let postcss = require('./build/lib/postcss');
    let real    = require('postcss-parser-tests/real');
    real(done, (css) => {
        return postcss.parse(css).toResult({ map: { annotation: false } });
    });
});

gulp.task('test', () => {
    require('./');
    let mocha = require('gulp-mocha');
    return gulp.src('test/*.es6', { read: false }).pipe(mocha());
});

// Helpers

gulp.task('cases', () => {
    let postcss = require('./lib/postcss');
    let jsonify = require('./test/utils/jsonify');
    let cases   = path.join(__dirname, 'test', 'cases');
    fs.readdirSync(cases).forEach( (name) => {
        if ( !name.match(/\.css$/) ) return;
        let css  = fs.readFileSync(path.join(cases, name));
        let root = postcss.parse(css, { from: '/' + name });
        let json = JSON.stringify(jsonify(root), null, 4);
        let file = path.join(cases, name.replace(/\.css$/, '.json'));
        fs.writeFileSync(file, json + '\n');
    });
});

// Common

gulp.task('default', ['lint', 'spellcheck', 'test', 'integration']);
