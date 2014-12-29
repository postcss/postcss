var Node   = require('./node');
var vendor = require('./vendor');

// CSS declaration like “color: black” in rules
class Declaration extends Node {
    constructor(defaults) {
        this.type = 'decl';
        super(defaults);
    }

    // Stringify declaration
    stringify(builder, semicolon) {
        var before = this.style('before');
        if ( before ) builder(before);

        var between = this.style('between', 'colon');
        var string  = this.prop + between + this.stringifyRaw('value');

        if ( this.important ) {
            string += this._important || ' !important';
        }

        if ( semicolon ) string += ';';
        builder(string, this);
    }
}

module.exports = Declaration;
