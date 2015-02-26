import vendor from './vendor';
import Node   from './node';

export default class Declaration extends Node {
    constructor(defaults) {
        this.type = 'decl';
        super(defaults);
    }

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
