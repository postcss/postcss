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
        } else if ( i != 'before'  && i != 'after' &&
                    i != 'between' && i != 'semicolon' ) {
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

    // Clone node and insert clone before current one.
    // It accept properties to change in clone and return new node.
    //
    //   decl.cloneBefore({ prop: '-webkit-' + del.prop });
    cloneBefore(overrides = { }) {
        var cloned = this.clone(overrides);
        this.parent.insertBefore(this, cloned);
        return cloned;
    }

    // Clone node and insert clone after current one.
    // It accept properties to change in clone and return new node.
    //
    //   decl.cloneAfter({ value: convertToRem(decl.value) });
    cloneAfter(overrides = { }) {
        var cloned = this.clone(overrides);
        this.parent.insertAfter(this, cloned);
        return cloned;
    }

    // Replace with node by another one.
    //
    //   decl.replaceWith(fixedDecl);
    replaceWith(node) {
        this.parent.insertBefore(this, node);
        this.removeSelf();
        return this;
    }

    // Remove node from current place and put to end of new one.
    // It will also clean node code styles, but will keep `between` if old
    // parent and new parent has same root.
    //
    //   rule.moveTo(atRule);
    moveTo(container) {
        this.cleanStyles(this.root() == container.root());
        this.removeSelf();
        container.append(this);
        return this;
    }

    // Remove node from current place and put to before other node.
    // It will also clean node code styles, but will keep `between` if old
    // parent and new parent has same root.
    //
    //   rule.moveBefore(rule.parent);
    moveBefore(node) {
        this.cleanStyles(this.root() == node.root());
        this.removeSelf();
        node.parent.insertBefore(node, this);
        return this;
    }

    // Remove node from current place and put to after other node.
    // It will also clean node code styles, but will keep `between` if old
    // parent and new parent has same root.
    //
    //   rule.moveAfter(rule.parent);
    moveAfter(node) {
        this.cleanStyles(this.root() == node.root());
        this.removeSelf();
        node.parent.insertAfter(node, this);
        return this;
    }

    // Return next node in parent. If current node is last one,
    // method will return `undefined`.
    //
    //   var next = decl.next();
    //   if ( next && next.prop == removePrefix(decl.prop) ) {
    //       decl.removeSelf();
    //   }
    next() {
        var index = this.parent.index(this);
        return this.parent.nodes[index + 1];
    }

    // Return previous node in parent. If current node is first one,
    // method will return `undefined`.
    //
    //   var prev = decl.prev();
    //   if ( prev && removePrefix(prev.prop) == decl.prop) ) {
    //       prev.removeSelf();
    //   }
    prev() {
        var index = this.parent.index(this);
        return this.parent.nodes[index - 1];
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
        if ( !detect ) detect = own;

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
        var root = this.root();
        if ( !root.styleCache ) root.styleCache = { };
        if ( typeof(root.styleCache[detect]) != 'undefined' ) {
            return root.styleCache[detect];
        }

        if ( detect == 'semicolon' ) {
            root.eachInside( (i) => {
                if ( i.nodes && i.nodes.length && i.last.type == 'decl' ) {
                    value = i.semicolon;
                    if ( typeof(value) != 'undefined' ) return false;
                }
            });
        } else if ( detect == 'emptyBody' ) {
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
                if ( i.nodes && (i.parent != root || root.first != i) ) {
                    if ( typeof(i.before) != 'undefined' ) {
                        value = i.before;
                        if ( value.indexOf('\n') != -1 ) {
                            value = value.replace(/[^\n]+$/, '');
                        }
                        return false;
                    }
                }
            });
        } else if ( detect == 'beforeClose' ) {
            root.eachInside( (i) => {
                if ( i.nodes && i.nodes.length > 0 ) {
                    if ( typeof(i.after) != 'undefined' ) {
                        value = i.after;
                        if ( value.indexOf('\n') != -1 ) {
                            value = value.replace(/[^\n]+$/, '');
                        }
                        return false;
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

            var node  = this.parent;
            var depth = 0;
            while ( node && node.type != 'root' ) {
                depth += 1;
                node = node.parent;
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

    // Return top parent , parent of parents.
    root() {
        var result = this;
        while ( result.parent ) result = result.parent;
        return result;
    }

    // Recursivelly remove all code style properties (`before` and `between`).
    cleanStyles(keepBetween) {
        delete this.before;
        delete this.after;
        if ( !keepBetween ) delete this.between;

        if ( this.nodes ) {
            for ( var i = 0; i < this.nodes.length; i++ ) {
                this.nodes[i].cleanStyles(keepBetween);
            }
        }
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
