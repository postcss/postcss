var through = require('through2');

var indent = function (biggest, current) {
    for ( var i = 0; i < biggest - current.length; i++ ) {
        process.stdout.write(' ');
    }
};

module.exports = through.obj(function (file, type, done) {
    var results = JSON.parse(file.contents.toString()).sort(function (a, b) {
        return b.hz - a.hz;
    });

    var longest = results.slice().sort(function (a, b) {
        return b.name.length - a.name.length;
    })[0].name.length;

    var slowest = results.map(function (i) {
        return Math.round((1 / i.hz) * 1000).toString().length;
    }).sort().reverse()[0];

    var postcss = results.find(function (i) {
        return i.name == 'PostCSS';
    }).hz;

    process.stdout.write('\n');
    results.forEach(function (i) {
        process.stdout.write(i.name + ': ');
        indent(longest, i.name);

        var time = Math.round((1 / i.hz) * 1000).toString();
        process.stdout.write(time + ' ms ');
        indent(slowest, time);

        if ( i.name != 'PostCSS' ) {
            var times;
            if ( i.hz > postcss ) {
                times = (i.hz / postcss).toFixed(1);
                process.stdout.write('(' + times + ' times faster)');
            } else {
                times = (postcss / i.hz).toFixed(1);
                process.stdout.write('(' + times + ' times slower)');
            }
        }
        process.stdout.write('\n');
    });

    process.stdout.write('\n');
    done();
});
