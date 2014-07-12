var Node   = require('./node');
var vendor = require('./vendor');

// CSS declaration like “color: black” in rules
class Declaration extends Node {
    constructor(defaults) {
        this.type = 'decl';
        super(defaults);
    }

    defaultStyle() {
        return { before: "\n    ", between: ': ' };
    }

    // Stringify declaration
    stringify(builder, semicolon) {
        var style = this.style();

        if ( style.before ) builder(style.before);
        var string  = this.prop + style.between + this.stringifyRaw('value');

        if ( this.important ) {
            string += this._important || ' !important';
        }

        if ( semicolon ) string += ';';
        builder(string, this);
    }

    // Clean `before` and `between` property in clone to copy it from new
    // parent rule
    clone(overrides = { }) {
        var cloned = super(overrides);
        delete cloned.before;
        delete cloned.between;
        return cloned;
    }
}

module.exports = Declaration;
