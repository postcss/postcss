module.exports = function (url, callback) {
    get(url, function (html) {
        var styles = html.match(/[^"]+\.css("|')/g);
        if ( !styles ) throw "Can't find CSS links at " + url;
        styles = styles.map(function(path) {
            path = path.slice(0, -1);
            if ( path.match(/^https?:/) ) {
                return path;
            } else {
                return path.replace(/^\.?\.?\/?/, url);
            }
        });
        callback(styles);
    });
};