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
    return gulp.src('lib/*.js')
        .pipe(babel({ loose: 'all' }))
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
            p.devDependencies.babel = p.dependencies.babel;
            delete p.dependencies.babel;
            return p;
        }))
        .pipe(gulp.dest('build'));
});

gulp.task('build', ['build:lib', 'build:docs', 'build:package']);

// Lint

gulp.task('lint', () => {
    let eslint = require('gulp-eslint');
    return gulp.src(['*.js', 'lib/*.js', 'test/*.js'])
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
    let gutil = require('gulp-util');
    let load  = require('load-resources');

    let postcss = require('./build/lib/postcss');

    let error = (url, message) => {
        gutil.log(gutil.colors.red('Fail on ' + url));
        done(new gutil.PluginError('integration', {
            showStack: false,
            message:   message
        }));
    };

    let sites = {
        GitHub:       'https://github.com/',
        Twitter:      'https://twitter.com/',
        Bootstrap:    'github:twbs/bootstrap:dist/css/bootstrap.css',
        Habrahabr:    'http://habrahabr.ru/',
        Browserhacks: 'http://browserhacks.com/'
    };
    let urls = Object.keys(sites).map( i => sites[i] );

    let lastDomain = false;
    let siteIndex  = -1;

    load(urls, '.css', (css, url, last) => {
        postcss().process(css, {
            map: { annotation: false },
            safe:  url.match('browserhacks.com')

        }).catch( (e) => {
            fs.writeFileSync('fail.css', css);
            return error(url, 'Parsing error: ' + e.message + e.stack);

        }).then( (result) => {
            if ( !result ) return;

            if ( result.css !== css ) {
                fs.writeFileSync('origin.css', css);
                fs.writeFileSync('fail.css', result.css);
                error(url, 'Output is not equal input');
                return;
            }

            let domain = url.match(/https?:\/\/[^\/]+/)[0];
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

gulp.task('test', () => {
    let mocha = require('gulp-mocha');
    return gulp.src('test/*.js', { read: false }).pipe(mocha());
});

// Helpers

gulp.task('cases', () => {
    let postcss = require('./lib/postcss');
    let cases   = path.join(__dirname, 'test', 'cases');
    fs.readdirSync(cases).forEach( (name) => {
        if ( !name.match(/\.css$/) ) return;
        let css  = fs.readFileSync(path.join(cases, name));
        let root = postcss.parse(css, { from: '/' + name });
        let json = JSON.stringify(root, null, 4);
        let file = path.join(cases, name.replace(/\.css$/, '.json'));
        fs.writeFileSync(file, json + '\n');
    });
});

// Common

gulp.task('default', ['lint', 'spellcheck', 'test', 'integration']);
