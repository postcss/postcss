import { Base64 } from 'js-base64';
import   mozilla  from 'source-map';
import   path     from 'path';
import   fs       from 'fs';

export default class PreviousMap {
    constructor(css, opts) {
        this.loadAnnotation(css);
        this.inline = this.startWith(this.annotation, 'data:');

        var prev = opts.map ? opts.map.prev : undefined;
        var text = this.loadMap(opts.from, prev);
        if ( text ) this.text = text;
    }

    consumer() {
        if ( !this.consumerCache ) {
            this.consumerCache = new mozilla.SourceMapConsumer(this.text);
        }
        return this.consumerCache;
    }

    withContent() {
        return !!(this.consumer().sourcesContent &&
                  this.consumer().sourcesContent.length > 0);
    }

    startWith(string, start) {
        if ( !string ) return false;
        return string.substr(0, start.length) == start;
    }

    loadAnnotation(css) {
        var match = css.match(/\/\*\s*# sourceMappingURL=(.*)\s*\*\//);
        if ( match ) this.annotation = match[1].trim();
    }

    decodeInline(text) {
        var uri    = 'data:application/json,';
        var base64 = 'data:application/json;base64,';

        if ( this.startWith(text, uri) ) {
            return decodeURIComponent( text.substr(uri.length) );

        } else if ( this.startWith(text, base64) ) {
            return Base64.decode( text.substr(base64.length) );

        } else {
            var encoding = text.match(/data:application\/json;([^,]+),/)[1];
            throw new Error('Unsupported source map encoding ' + encoding);
        }
    }

    loadMap(file, prev) {
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
            if ( file ) map = path.join(path.dirname(file), map);

            this.root = path.dirname(map);
            if ( fs.existsSync && fs.existsSync(map) ) {
                return fs.readFileSync(map, 'utf-8').toString().trim();
            }
        }
    }
}
