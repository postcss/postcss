var Result = require('./result');

var base64js = require('base64-js');
var mozilla  = require('source-map');
var path     = require('path');

// All tools to generate source maps
class MapGenerator {
    constructor(root, opts) {
        this.root    = root;
        this.opts    = opts;
        this.mapOpts = opts.map || { };
    }

    // Should map be generated
    isMap() {
        if ( typeof(this.opts.map) != 'undefined' ) {
            return !!this.opts.map;
        } else {
            return this.previous().length > 0;
        }
    }

    // Return source map arrays from previous compilation step (like Sass)
    previous() {
        if ( !this.previousMaps ) {
            this.previousMaps = [];
            this.root.eachInside( (node) => {
                if ( node.source && node.source.map ) {
                    if ( this.previousMaps.indexOf(node.source.map) == -1 ) {
                        this.previousMaps.push(node.source.map);
                    }
                }
            });
        }

        return this.previousMaps;
    }

    // Should we inline source map to annotation comment
    isInline() {
        if ( typeof(this.mapOpts.inline) != 'undefined' ) {
            return this.mapOpts.inline;
        }
        return this.previous().some( i => i.inline );
    }

    // Should we set sourcesContent
    isSourcesContent() {
        if ( typeof(this.mapOpts.sourcesContent) != 'undefined' ) {
            return this.mapOpts.sourcesContent;
        }
        return this.previous().some( i => i.withContent() );
    }

    // Clear source map annotation comment
    clearAnnotation() {
        var last = this.root.last;
        if ( !last ) return;
        if ( last.type != 'comment' ) return;

        if ( last.text.match(/^# sourceMappingURL=/) ) {
            last.removeSelf();
        }
    }

    // Set origin CSS content
    setSourcesContent() {
        var already = { };
        this.root.eachInside( (node) => {
            var file = node.source.file || node.source.id;
            if ( node.source && !already[file] ) {
                already[file] = true;
                var relative = this.relative(file);
                this.map.setSourceContent(relative, node.source.content);
            }
        });
    }

    // Apply source map from previous compilation step (like Sass)
    applyPrevMaps() {
        for ( var prev of this.previous() ) {
            var from = this.relative(prev.file);
            var root = prev.root || path.dirname(prev.file);
            var map;

            if ( this.mapOpts.sourcesContent === false ) {
                map = new mozilla.SourceMapConsumer(prev.text);
                map.sourcesContent = map.sourcesContent.map( i => null );
            } else {
                map = prev.consumer();
            }

            this.map.applySourceMap(map, from, this.relative(root));
        }
    }

    // Should we add annotation comment
    isAnnotation() {
        if ( this.isInline() ) {
            return true ;
        } else if ( typeof(this.mapOpts.annotation) != 'undefined' ) {
            return this.mapOpts.annotation;
        } else if ( this.previous().length ) {
            return this.previous().some( i => i.annotation );
        } else {
            return true;
        }
    }

    // Add source map annotation comment if it is needed
    addAnnotation() {
        var content;

        if ( this.isInline() ) {
            var string = this.map.toString();
            var bytes  = [];
            for ( var i = 0; i < string.length; i++ ) {
                bytes.push( string.charCodeAt(i) );
            }
            content = "data:application/json;base64," +
                       base64js.fromByteArray(bytes);

        } else if ( typeof(this.mapOpts.annotation) == 'string' ) {
            content = this.mapOpts.annotation;

        } else {
            content = this.outputFile() + '.map';
        }

        this.css += "\n/*# sourceMappingURL=" + content + " */";
    }

    // Return output CSS file path
    outputFile() {
        return this.opts.to ? this.relative(this.opts.to) : 'to.css';
    }

    // Return Result object with map
    generateMap() {
        this.stringify();
        if ( this.isSourcesContent() )    this.setSourcesContent();
        if ( this.previous().length > 0 ) this.applyPrevMaps();
        if ( this.isAnnotation() )        this.addAnnotation();

        if ( this.isInline() ) {
            return [this.css];
        } else {
            return [this.css, this.map];
        }
    }

    // Return path relative from output CSS file
    relative(file) {
        var from = this.opts.to ? path.dirname(this.opts.to) : '.';

        if ( typeof(this.mapOpts.annotation) == 'string' ) {
            from = path.dirname( path.resolve(from, this.mapOpts.annotation) );
        }

        file = path.relative(from, file);
        if ( path.sep == '\\' ) {
            return file.replace('\\', '/');
        } else {
            return file;
        }
    }

    // Return path of node source for map
    sourcePath(node) {
        return this.relative(node.source.file || 'from.css');
    }

    // Return CSS string and source map
    stringify() {
        this.css = '';
        this.map = new mozilla.SourceMapGenerator({ file: this.outputFile() });

        var line   = 1;
        var column = 1;

        var lines, last;
        var builder = (str, node, type) => {
            this.css += str;

            if ( node && node.source && node.source.start && type != 'end' ) {
                this.map.addMapping({
                    source:   this.sourcePath(node),
                    original: {
                        line:   node.source.start.line,
                        column: node.source.start.column - 1
                    },
                    generated: {
                        line:   line,
                        column: column - 1
                    }
                });
            }

            lines = str.match(/\n/g);
            if ( lines ) {
                line  += lines.length;
                last   = str.lastIndexOf("\n");
                column = str.length - last;
            } else {
                column = column + str.length;
            }

            if ( node && node.source && node.source.end && type != 'start' ) {
              this.map.addMapping({
                  source:   this.sourcePath(node),
                  original: {
                      line:   node.source.end.line,
                      column: node.source.end.column
                  },
                  generated: {
                      line:   line,
                      column: column
                  }
              });
            }
        };

        this.root.stringify(builder);
    }

    // Return Result object with or without map
    generate() {
        this.clearAnnotation();

        if ( this.isMap() ) {
            return this.generateMap();
        } else {
            return [this.root.toString()];
        }
    }
}

module.exports = MapGenerator;
