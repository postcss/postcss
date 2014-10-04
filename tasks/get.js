var zlib, request;
module.exports = function (url, callback) {
    if ( !zlib ) {
        zlib    = require('zlib');
        request = require('request');
    }

    request.get({ url: url, headers: { 'accept-encoding': 'gzip,deflate' } })
        .on('response', function (res) {
            var chunks = [];
            res.on('data', function (i) {
                chunks.push(i);
            });
            res.on('end', function () {
                var buffer = Buffer.concat(chunks);

                if ( res.headers['content-encoding'] == 'gzip' ) {
                    zlib.gunzip(buffer, function (err, decoded) {
                        callback(decoded.toString());
                    });

                } else if ( res.headers['content-encoding'] == 'deflate' ) {
                    zlib.inflate(buffer, function (err, decoded) {
                        callback(decoded.toString());
                    });

                } else {
                    callback(buffer.toString());
                }
            });
        });
};