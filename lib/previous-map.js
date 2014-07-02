var base64js = require('base64-js');
var mozilla  = require('source-map');
var path     = require('path');
var fs       = require('fs');

// Detect previous map
class PreviousMap {
    constructor(root, opts) {
        this.file = opts.from;

        this.loadAnnotation(root);
        var inlinePrefix = '# sourceMappingURL=data:'
        this.inline = this.startWith(this.annotation, inlinePrefix);

        var text = this.loadMap(opts.map ? opts.map.prev : undefined);
        if ( text ) this.text = text;
    }

    // Return SourceMapConsumer object to read map
    consumer() {
        if ( this.consumerCache ) return this.consumerCache;
        return this.consumerCache = new mozilla.SourceMapConsumer(this.text);
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
    loadAnnotation(root) {
        var last = root.last;
        if ( !last ) return;
        if ( last.type != 'comment' ) return;

        if ( this.startWith(last.text, '# sourceMappingURL=') ) {
            this.annotation = last.text
        }
    }

    // Encode different type of inline
    decodeInline(text) {
        var uri    = '# sourceMappingURL=data:application/json,';
        var base64 = '# sourceMappingURL=data:application/json;base64,';

        if ( this.startWith(text, uri) ) {
            return decodeURIComponent( text.substr(uri.length) )

        } else if ( this.startWith(text, base64) ) {
            var string = '';
            var bytes  = base64js.toByteArray( text.substr(base64.length) );
            for ( var i = 0; i < bytes.length; i++ ) {
                string += String.fromCharCode(bytes[i]);
            }
            return string;

        } else
            var encoding = text.match(/ata:application\/json;([^,]+),/)[1];
            throw new Error('Unsupported source map encoding ' + encoding);
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
            var map = this.annotation.replace('# sourceMappingURL=', '');
            if ( this.file ) map = path.join(path.dirname(this.file), map);

            this.root = path.dirname(map);
            if ( fs.existsSync && fs.existsSync(map) ) {
                return fs.readFileSync(map).toString();
            }
        }
    }
}

module.exports = PreviousMap;
