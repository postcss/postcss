var CssSyntaxError = require('./css-syntax-error');

// Recursivly clone objects
var clone = function (obj, parent) {
    if ( typeof(obj) != 'object' ) return obj;
    var cloned = new obj.constructor();

    for ( var i in obj ) {
        if ( !obj.hasOwnProperty(i) ) continue;
        var value = obj[i];

        if ( i == 'parent' && typeof(value) == 'object' ) {
            if (parent) cloned[i] = parent;
        } else if ( i == 'source' ) {
            cloned[i] = value;
        } else if ( value instanceof Array ) {
            cloned[i] = value.map( i => clone(i, cloned) );
        } else if ( i != 'before' && i != 'between' &&
                    i != 'after'  && i != 'semicolon' ) {
            cloned[i] = clone(value, cloned);
        }
    }

    return cloned;
};

// Some common methods for all CSS nodes
class Node {
    constructor(defaults = { }) {
        for ( var name in defaults ) {
            this[name] = defaults[name];
        }
    }

    // Return error to mark error in your plugin syntax:
    //
    //   if ( wrongVariable ) {
    //       throw decl.error('Wrong variable');
    //   }
    //
    // You can also get origin line and column from previous source map:
    //
    //   if ( deprectedSyntax ) {
    //       var error = decl.error('Deprected syntax');
    //       console.warn(error.toString());
    //   }
    error(message) {
        if ( this.source ) {
            var pos = this.source.start;
            return this.source.input.error(message, pos.line, pos.column);
        } else {
            return new CssSyntaxError(message);
        }
    }

    // Remove this node from parent
    //
    //   decl.removeSelf();
    //
    // Note, that removing by index is faster:
    //
    //   rule.each( (decl, i) => rule.remove(i) );
    removeSelf() {
        if ( this.parent ) {
            this.parent.remove(this);
        }
        this.parent = undefined;
        return this;
    }

    // Shortcut to insert nodes before and remove self.
    //
    //   importNode.replace( loadedRoot );
    replace(nodes) {
        this.parent.insertBefore(this, nodes);
        this.parent.remove(this);
        return this;
    }

    // Return CSS string of current node
    //
    //   decl.toString(); //=> "  color: black"
    toString() {
        var result  = '';
        var builder = (str) => result += str;
        this.stringify(builder);
        return result;
    }

    // Clone current node
    //
    //   rule.append( decl.clone() );
    //
    // You can override properties while cloning:
    //
    //   rule.append( decl.clone({ value: '0' }) );
    clone(overrides = { }) {
        var cloned = clone(this);
        for ( var name in overrides ) {
            cloned[name] = overrides[name];
        }
        return cloned;
    }

    // Alias for `node.parent.insertBefore(node, node.clone())`.
    // It accept properties to change in clone and return new node.
    //
    //   decl.cloneBefore({ prop: '-webkit-' + del.prop });
    cloneBefore(overrides = { }) {
        var cloned = this.clone(overrides);
        this.parent.insertBefore(this, cloned);
        return cloned;
    }

    // Alias for `node.parent.insertAfter(node, node.clone())`.
    // It accept properties to change in clone and return new node.
    //
    //   decl.cloneAfter({ value: convertToRem(decl.value) });
    cloneAfter(overrides = { }) {
        var cloned = this.clone(overrides);
        this.parent.insertAfter(this, cloned);
        return cloned;
    }

    // Remove `parent` node on cloning to fix circular structures
    toJSON() {
        var fixed = { };

        for ( var name in this ) {
            if ( !this.hasOwnProperty(name) ) continue;
            if ( name == 'parent' ) continue;
            var value = this[name];

            if ( value instanceof Array ) {
                fixed[name] = value.map( (i) => {
                    return (typeof(i) == 'object' && i.toJSON) ? i.toJSON() : i;
                });
            } else if ( typeof(value) == 'object' && value.toJSON ) {
                fixed[name] = value.toJSON();
            } else {
                fixed[name] = value;
            }
        }

        return fixed;
    }

    // Copy code style from first node with same type
    style(own, detect) {
        var value;

        // Already had
        if ( own ) {
            value = this[own];
            if ( typeof(value) != 'undefined' ) return value;
        }

        var parent = this.parent;

        // Hack for first rule in CSS
        if ( detect == 'before' ) {
            if ( !parent || (parent.type == 'root' && parent.first == this) ) {
                return '';
            }
        }

        // Floating child without parent
        if ( !parent ) return this.defaultStyle[detect];

        // Detect style by other nodes
        var root  = this;
        var depth = 0;
        while ( root.parent ) {
            root = root.parent;
            if ( root.type != 'root' ) depth += 1;
        }

        if ( !root.styleCache ) root.styleCache = { };
        if ( typeof(root.styleCache[detect]) != 'undefined' ) {
            return root.styleCache[detect];
        }

        if ( detect == 'emptyBody' ) {
            root.eachInside( (i) => {
                if ( i.nodes && i.nodes.length === 0 ) {
                    value = i.after;
                    if ( typeof(value) != 'undefined' ) return false;
                }
            });
        } else if ( detect == 'indent' ) {
            root.eachInside( (i) => {
                if ( i.parent != root && i.parent.parent == root ) {
                    if ( typeof(i.before) != 'undefined' ) {
                        var parts = i.before.split('\n');
                        value = parts[parts.length - 1];
                        return false;
                    }
                }
            });
        } else if ( detect == 'beforeDecl' ) {
            root.eachDecl( (i) => {
                if ( typeof(i.before) != 'undefined' ) {
                    value = i.before;
                    if ( value.indexOf('\n') != -1 ) {
                        value = value.replace(/[^\n]+$/, '');
                    }
                    return false;
                }
            });
            if ( typeof(value) == 'undefined' ) {
                value = this.style(null, 'beforeRule');
            }
        } else if ( detect == 'beforeRule' ) {
            root.eachInside( (i) => {
                if ( i.nodes && i.nodes.length > 0 ) {
                    if ( i.parent != root || root.first != i ) {
                        if ( typeof(i.before) != 'undefined' ) {
                            value = i.before;
                            if ( value.indexOf('\n') != -1 ) {
                                value = value.replace(/[^\n]+$/, '');
                            }
                            return false;
                        }
                    }
                }
            });
        } else if ( detect == 'beforeClose' ) {
            root.eachInside( (i) => {
                if ( i.nodes && i.nodes.length > 0 ) {
                    if ( i.parent != root || root.first != i ) {
                        if ( typeof(i.after) != 'undefined' ) {
                            value = i.after;
                            if ( value.indexOf('\n') != -1 ) {
                                value = value.replace(/[^\n]+$/, '');
                            }
                            return false;
                        }
                    }
                }
            });
        } else if ( detect == 'before' || detect == 'after' ) {
            if ( this.type == 'decl' ) {
                value = this.style(null, 'beforeDecl');
            } else if ( detect == 'before' ) {
                value = this.style(null, 'beforeRule');
            } else {
                value = this.style(null, 'beforeClose');
            }

            if ( value.indexOf('\n') != -1 ) {
                var indent = this.style(null, 'indent');
                if ( indent.length ) {
                    for ( var step = 0; step < depth; step++ ) value += indent;
                }
            }

            return value;
        } else if ( detect == 'colon' ) {
            root.eachDecl( (i) => {
                value = i.between;
                if ( typeof(value) != 'undefined' ) return false;
            });
        } else if ( detect == 'beforeOpen' ) {
            root.eachInside( (i) => {
                if ( i.type != 'decl' ) {
                    value = i.between;
                    if ( typeof(value) != 'undefined' ) return false;
                }
            });
        } else {
            root.eachInside( (i) => {
                value = i[own];
                if ( typeof(value) != 'undefined' ) return false;
            });
        }

        if ( typeof(value) == 'undefined' ) value = this.defaultStyle[detect];

        root.styleCache[detect] = value;
        return value;
    }

    // Use raw value if origin was not changed
    stringifyRaw(prop) {
        var value = this[prop];
        var raw   = this['_' + prop];
        if ( raw && raw.value === value ) {
            return raw.raw;
        } else {
            return value;
        }
    }
}

// Default code style
Node.prototype.defaultStyle = {
    colon:        ': ',
    indent:       '    ',
    beforeDecl:   '\n',
    beforeRule:   '\n',
    beforeClose:  '\n',
    commentLeft:  ' ',
    commentRight: ' ',
    beforeOpen:   ' ',
    after:        '\n',
    emptyBody:    ''
};

module.exports = Node;
