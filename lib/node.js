var CssSyntaxError = require('./css-syntax-error');

// Recursivly clone objects
var clone = function (obj, parent) {
    if ( typeof(obj) != 'object' ) return obj;
    var cloned = new obj.constructor();

    for ( var name in obj ) {
        if ( !obj.hasOwnProperty(name) ) continue;
        var value = obj[name];

        if ( name == 'parent' && typeof(value) == 'object' ) {
            if (parent) cloned[name] = parent;
        } else if ( name == 'source' ) {
            cloned[name] = value;
        } else if ( value instanceof Array ) {
            cloned[name] = value.map( i => clone(i, cloned) );
        } else {
            cloned[name] = clone(value, cloned);
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

    styleMap() {
        return { };
    }

    // Copy code style from first node with same type
    style(name) {
        // Already had
        var value = this.styleMap()[name];
        if ( typeof(value) != 'undefined' ) return value;

        var parent = this.parent;

        // Hack for first rule in CSS
        if ( !parent && (name == 'beforeRule' || name == 'beforeDecl') ) {
            return '';
        }
        if ( name == 'beforeRule' && !parent.parent && parent.first == this ) {
            return '';
        }

        // Floating child without parent
        if ( !parent ) return this.defaultStyle[name];

        // Detect style by other nodes
        var root = parent;
        while ( root.parent ) root = root.parent;

        if ( !root.styleCache ) root.styleCache = { };
        if ( typeof(root.styleCache[name]) != 'undefined' ) {
            return root.styleCache[name];
        }

        root.eachInside( (other) => {
            value = other.styleMap()[name];
            if ( typeof(value) != 'undefined' ) return false;
        });
        if ( typeof(value) == 'undefined' ) value = this.defaultStyle[name];

        root.styleCache[name] = value;
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
    beforeDecl:   '\n    ',
    commentLeft:  ' ',
    commentRight: ' ',
    beforeRule:   '\n',
    beforeOpen:   ' ',
    beforeClose:  '\n',
    emptyBody:    ''
};

module.exports = Node;
