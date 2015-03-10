export default class Warning {
    constructor(text, opts = { }) {
        this.type = 'warning';
        this.text = text;
        for ( let opt in opts ) {
            this[opt] = opts[opt];
        }
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
