import Node from './node';

export default class Declaration extends Node {
    constructor(defaults) {
        this.type = 'decl';
        super(defaults);
    }

    stringify(builder, semicolon) {
        let before = this.style('before');
        if ( before ) builder(before);

        let between = this.style('between', 'colon');
        let string  = this.prop + between + this.stringifyRaw('value');

        if ( this.important ) {
            string += this._important || ' !important';
        }

        if ( semicolon ) string += ';';
        builder(string, this);
    }
}
