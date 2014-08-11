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

// Is `obj` has all keys from `keys`. Return `false` of object with keys from
// `keys` and values from `obj`.
var keys = function (obj, keys) {
    var all = { };

    for ( var key in keys ) {
        if ( typeof(obj[key]) == 'undefined' ) {
            return false;
        } else {
            all[key] = obj[key];
        }
    }

    return all;
};

// Some common methods for all CSS nodes
class Node {
    constructor(defaults = { }) {
        for ( var name in defaults ) {
            this[name] = defaults[name];
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

    // Default code style
    defaultStyle() {
        return { };
    }

    // Allow to split node with same type by other critera.
    // For example, to use different style for bodiless at-rules.
    styleType() {
        return this.type;
    }

    // Copy code style from first node with same type
    style() {
        var type     = this.styleType();
        var defaults = this.defaultStyle(type);

        var all = keys(this, defaults);
        if ( all ) return all;

        var styled = defaults;
        if ( this.parent ) {

            var root = this;
            while ( root.parent ) root = root.parent;

            if ( !root.styleCache ) root.styleCache = { };
            if ( root.styleCache[type] ) {
                styled = root.styleCache[type];

            } else {
                root.eachInside( (another) => {
                    if ( another.styleType() != type ) return;
                    if ( this == another )             return;

                    all = keys(another, styled);
                    if ( all ) {
                        styled = all;
                        return false;
                    }
                });

                root.styleCache[type] = styled;
            }
        }

        var merge = { };
        for ( var key in styled ) {
            if ( typeof(this[key]) == 'undefined' ) {
                merge[key] = styled[key];
            } else {
                merge[key] = this[key];
            }
        }

        return merge;
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

module.exports = Node;
