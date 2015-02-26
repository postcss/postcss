import Result from './result';

import { Base64 } from 'js-base64';
import   mozilla  from 'source-map';
import   path     from 'path';

export default class MapGenerator {
    constructor(root, opts) {
        this.root    = root;
        this.opts    = opts;
        this.mapOpts = opts.map || { };
    }

    isMap() {
        if ( typeof(this.opts.map) != 'undefined' ) {
            return !!this.opts.map;
        } else {
            return this.previous().length > 0;
        }
    }

    previous() {
        if ( !this.previousMaps ) {
            this.previousMaps = [];
            this.root.eachInside( (node) => {
                if ( node.source && node.source.input.map ) {
                    var map = node.source.input.map;
                    if ( this.previousMaps.indexOf(map) == -1 ) {
                        this.previousMaps.push(map);
                    }
                }
            });
        }

        return this.previousMaps;
    }

    isInline() {
        if ( typeof(this.mapOpts.inline) != 'undefined' ) {
            return this.mapOpts.inline;
        }

        var annotation = this.mapOpts.annotation;
        if ( typeof(annotation) != 'undefined' && annotation !== true ) {
            return false;
        }

        if ( this.previous().length ) {
            return this.previous().some( i => i.inline );
        } else {
            return true;
        }
    }

    isSourcesContent() {
        if ( typeof(this.mapOpts.sourcesContent) != 'undefined' ) {
            return this.mapOpts.sourcesContent;
        }
        if ( this.previous().length ) {
            return this.previous().some( i => i.withContent() );
        } else {
            return true;
        }
    }

    clearAnnotation() {
        if ( this.mapOpts.annotation === false ) return;

        var node;
        for ( var i = this.root.nodes.length - 1; i >= 0; i-- ) {
            node = this.root.nodes[i];
            if ( node.type != 'comment' ) continue;
            if ( node.text.match(/^# sourceMappingURL=/) ) {
                this.root.remove(i);
                return;
            }
        }
    }

    setSourcesContent() {
        var already = { };
        this.root.eachInside( (node) => {
            if ( node.source ) {
                var from = node.source.input.from;
                if ( from && !already[from] ) {
                    already[from] = true;
                    var relative = this.relative(from);
                    this.map.setSourceContent(relative, node.source.input.css);
                }
            }
        });
    }

    applyPrevMaps() {
        for ( var prev of this.previous() ) {
            var from = this.relative(prev.file);
            var root = prev.root || path.dirname(prev.file);
            var map;

            if ( this.mapOpts.sourcesContent === false ) {
                map = new mozilla.SourceMapConsumer(prev.text);
                if ( map.sourcesContent ) {
                    map.sourcesContent = map.sourcesContent.map( i => null );
                }
            } else {
                map = prev.consumer();
            }

            this.map.applySourceMap(map, from, this.relative(root));
        }
    }

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

    addAnnotation() {
        var content;

        if ( this.isInline() ) {
            content = "data:application/json;base64," +
                       Base64.encode( this.map.toString() );

        } else if ( typeof(this.mapOpts.annotation) == 'string' ) {
            content = this.mapOpts.annotation;

        } else {
            content = this.outputFile() + '.map';
        }

        this.css += "\n/*# sourceMappingURL=" + content + " */";
    }

    outputFile() {
        if ( this.opts.to ) {
            return this.relative(this.opts.to);
        } else if ( this.opts.from ) {
            return this.relative(this.opts.from);
        } else {
            return 'to.css';
        }
    }

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

    relative(file) {
        var from = this.opts.to ? path.dirname(this.opts.to) : '.';

        if ( typeof(this.mapOpts.annotation) == 'string' ) {
            from = path.dirname( path.resolve(from, this.mapOpts.annotation) );
        }

        file = path.relative(from, file);
        if ( path.sep == '\\' ) {
            return file.replace(/\\/g, '/');
        } else {
            return file;
        }
    }

    sourcePath(node) {
        return this.relative(node.source.input.from);
    }

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

    generate() {
        this.clearAnnotation();

        if ( this.isMap() ) {
            return this.generateMap();
        } else {
            return [this.root.toString()];
        }
    }
}
