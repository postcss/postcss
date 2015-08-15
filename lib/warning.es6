export default class Warning {

    type = 'warning'

    constructor(text, opts = { }) {
        this.text = text;

        if ( opts.node ) {
            let pos     = opts.node.positionBy(opts);
            this.line   = pos.line;
            this.column = pos.column;
        }

        for ( let opt in opts ) this[opt] = opts[opt];
    }

    toString() {
        if ( this.node ) {
            return this.node.error(this.text, { plugin: this.plugin }).message;
        } else if ( this.plugin ) {
            return this.plugin + ': ' + this.text;
        } else {
            return this.text;
        }
    }

}
