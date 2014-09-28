var through = require('through2');
var gutil   = require('gulp-util');
var path    = require('path');
var gulp    = require('gulp');

module.exports = function(results) {
  return through.obj(function(file, type, done) {
    gulp.src(results).pipe(createPipe(file, done));
    this.push(file);
  });
};


function compare(prev, cur) {
  var fname = prev.fname;
  prev = prev.contents;
  cur = cur.contents;
  for(var i = 0; i < prev.length; i++) {
    pres = prev[i].hz.toFixed(2);
    cres = cur[i].hz.toFixed(2);
    gutil.log(gutil.colors.cyan('current'),
      'with', gutil.colors.magenta(cres), 'vs ' +
      gutil.colors.cyan(path.basename(fname, '.json')) +' with',
      gutil.colors.magenta(pres), 'for ' + cur[i].name);
  }
}

function buff2json(buff) {
  return {
    contents: JSON.parse(buff.contents.toString()),
    fname: path.basename(buff.path)
  };
}

function createPipe(file, alldone) {
  var currentBench = buff2json(file);
  return through.obj(function(file, type, done) {
    var prevBench = buff2json(file);
    compare(prevBench, currentBench);
    done();
  }, function(cb) {
    alldone();
    cb();
  });
}