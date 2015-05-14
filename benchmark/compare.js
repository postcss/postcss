var through = require('through2');
var gutil   = require('gulp-util');
var path    = require('path');
var gulp    = require('gulp');

function compare(prev, current) {
    var prevName    = path.basename(prev.file, '.json');
    var currentName = path.basename(current.file, '.json');
    prev    = prev.contents[0].hz;
    current = current.contents[0].hz;
    if ( current > prev ) {
        gutil.log(currentName, 'is',
            gutil.colors.green( (current / prev).toFixed(2) + ' times faster'),
            'that', prevName);
    } else {
        gutil.log(currentName, 'is',
            gutil.colors.red( (prev / current).toFixed(2) + ' times slower'),
            'that', prevName);
    }
}

function result(buff) {
    return {
        contents: JSON.parse(buff.contents.toString()),
        file:     path.basename(buff.path)
    };
}

function pipe(file, alldone) {
    var current = result(file);

    return through.obj(function (prevFile, type, done) {
        var prev = result(prevFile);
        compare(prev, current);
        done();
    }, function (callback) {
        alldone();
        callback();
    });
}

module.exports = function(name) {
    return through.obj(function (file, type, done) {
        gulp.src(['!benchmark/results/' + name + '.json',
                  'benchmark/results/*.json']).pipe( pipe(file, done) );
        this.push(file);
    });
};
