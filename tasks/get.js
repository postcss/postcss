var request = require('request');
var zlib    = require('zlib');

var load = function (url, callback, errors) {
    request.get({
        url:     url,
        headers: { 'accept-encoding': 'gzip,deflate' }
    }).on('error', function (error) {
        if ( errors > 2 ) throw error;
        console.error(error.toString());
        load(url, callback, (errors || 1) + 1);
    }).on('response', function (res) {
        callback(res);
    });
};

module.exports = function (url, callback) {
    if ( url.match(/^github:/) ) {
        var p = url.split(':');
        url = 'https://raw.githubusercontent.com/' + p[1] + '/master/' + p[2];
    }

    load(url, function (res) {
        var chunks = [];
        res.on('data', function (i) {
            chunks.push(i);
        });
        res.on('end', function () {
            var buffer = Buffer.concat(chunks);

            if ( res.headers['content-encoding'] === 'gzip' ) {
                zlib.gunzip(buffer, function (err, decoded) {
                    if ( err ) throw err;
                    callback(decoded.toString());
                });

            } else if ( res.headers['content-encoding'] === 'deflate' ) {
                zlib.inflate(buffer, function (err, decoded) {
                    if ( err ) throw err;
                    callback(decoded.toString());
                });

            } else {
                callback(buffer.toString());
            }
        });
    });
};
