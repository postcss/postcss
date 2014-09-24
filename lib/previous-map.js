var mozilla = require('source-map');
var Base64  = require('js-base64').Base64;
var path    = require('path');
var fs      = require('fs');

// Detect previous map
class PreviousMap {
    constructor(css, opts, id) {
        this.file = opts.from;

        this.loadAnnotation(css);
        this.inline = this.startWith(this.annotation, 'data:');

        var text = this.loadMap(opts.map ? opts.map.prev : undefined);
        if ( text ) {
            this.text = text;
            if ( !this.file ) this.file = this.consumer().file;
        }
        if ( !this.file ) this.file = id;
    }

    // Return SourceMapConsumer object to read map
    consumer() {
        if ( !this.consumerCache ) {
            this.consumerCache = new mozilla.SourceMapConsumer(this.text);
        }
        return this.consumerCache;
    }

    // Is map has sources content
    withContent() {
        return !!(this.consumer().sourcesContent &&
                  this.consumer().sourcesContent.length > 0);
    }

    // Is `string` is starting with `start`
    startWith(string, start) {
        if ( !string ) return false;
        return string.substr(0, start.length) == start;
    }

    // Load for annotation comment from previous compilation step
    loadAnnotation(css) {
        var match = css.match(/\/\*\s*# sourceMappingURL=(.*)\s*\*\//);
        if ( match ) this.annotation = match[1].trim();
    }

    // Encode different type of inline
    decodeInline(text) {
        var uri    = 'data:application/json,';
        var base64 = 'data:application/json;base64,';

        if ( this.startWith(text, uri) ) {
            return decodeURIComponent( text.substr(uri.length) );

        } else if ( this.startWith(text, base64) ) {
            return Base64.decode( text.substr(base64.length) );

        } else {
            var encoding = text.match(/ata:application\/json;([^,]+),/)[1];
            throw new Error('Unsupported source map encoding ' + encoding);
        }
    }

    // Load previous map
    loadMap(prev) {
        if ( prev === false ) return;

        if ( prev ) {
            if ( typeof(prev) == 'string' ) {
                return prev;
            } else if ( prev instanceof mozilla.SourceMapConsumer ) {
                return mozilla.SourceMapGenerator
                    .fromSourceMap(prev).toString();
            } else if ( prev instanceof mozilla.SourceMapGenerator ) {
                return prev.toString();
            } else if ( typeof(prev) == 'object' && prev.mappings ) {
                return JSON.stringify(prev);
            } else {
                throw new Error('Unsupported previous source map format: ' +
                    prev.toString());
            }

        } else if ( this.inline ) {
            return this.decodeInline(this.annotation);

        } else if ( this.annotation ) {
            var map = this.annotation;
            if ( this.file ) map = path.join(path.dirname(this.file), map);

            this.root = path.dirname(map);
            if ( fs.existsSync && fs.existsSync(map) ) {
                return fs.readFileSync(map, 'utf-8').toString().trim();
            }
        }
    }
}

module.exports = PreviousMap;
