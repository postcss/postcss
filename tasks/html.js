var request = require('request');
var zlib    = require('zlib');

module.exports = {

    get: function (url, callback) {
        if ( url.match(/^github:/) ) {
            var parts = url.split(':');
            url = 'https://raw.githubusercontent.com/' +
                parts[1] + '/master/' + parts[2];
        }

        request.get({ url: url, headers: {'accept-encoding': 'gzip,deflate'} })
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
    },

    styles: function (url, callback) {
        if ( url.match(/\.css$/) ) {
            callback([url]);
            return;
        }

        this.get(url, function (html) {
            var files = html.match(/[^"]+\.css("|')/g);
            if ( !files ) throw "Can't find CSS links at " + url;
            files = files.map(function(path) {
                path = path.slice(0, -1);
                if ( path.match(/^https?:/) ) {
                    return path;
                } else {
                    return path.replace(/^\.?\.?\/?/, url);
                }
            });
            callback(files);
        });
    }

};
