var get = require('./get');

var findStyles = function (url, callback) {
    if ( url.match(/\.css$/) ) {
        callback([url]);
        return;
    }

    get(url, function (html) {
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
};

module.exports = function (sites, callbacks) {
    var nextLink, nextSite;

    var links = [];
    nextLink = function () {
        if ( links.length === 0 ) {
            nextSite();
            return;
        }

        var url = links.shift();
        get(url, function (css) {
            if ( callbacks.css(css, url) ) {
                nextLink();
            }
        });
    };

    nextSite = function () {
        if ( sites.length === 0 ) {
            callbacks.done();
            return;
        }
        var site = sites.shift();
        var name = Object.keys(site)[0];
        callbacks.site(name);

        findStyles(site[name], function (files) {
            links = files;
            nextLink();
        });
    };

    nextSite();
};
