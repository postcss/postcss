var through = require('through2');
var gutil   = require('gulp-util');
var path    = require('path');
var gulp    = require('gulp');

function compare(prev, current) {
    var prevName    = path.basename(prev.file, '.json');
    var currentName = path.basename(current.file, '.json');
    prev     = prev.contents;
    current  = current.contents;
    for ( var i = 0; i < prev.length; i++ ) {
        prevResult    = prev[i].hz.toFixed(2);
        currentResult = current[i].hz.toFixed(2);
        gutil.log(currentName, gutil.colors.cyan(currentResult), 'vs',
                  prevName,    gutil.colors.magenta(prevResult));
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

    return through.obj(function (file, type, done) {
        var prev = result(file);
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
