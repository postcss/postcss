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

    // Some magic for !important

    get important() {
        return !!this._important;
    }

    set important(value) {
        if ( typeof(value) == 'string' && value != '' ) {
            this._important = value;
        } else if ( value ) {
            this._important = ' !important';
        } else {
            this._important = false;
        }
    }

    // Stringify declaration
    stringify(builder, semicolon) {
        var style = this.style();

        if ( style.before ) builder(style.before)
        var string  = this.prop + style.between + this._value.toString();
        string += this._important || '';
        if ( semicolon ) string += ';'
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

Declaration.raw('value');

module.exports = Declaration;
