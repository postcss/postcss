export default class Result {
    constructor(processor, root, opts) {
        this.processor = processor;
        this.messages  = [];
        this.root      = root;
        this.opts      = opts;
        this.css       = undefined;
        this.map       = undefined;
    }

    toString() {
        return this.css;
    }

    warn(text, data = { }) {
        data.type = 'warning';
        data.text = text;

        if ( !data.plugin ) {
            if ( this.lastPlugin && this.lastPlugin.postcssPlugin ) {
                data.plugin = this.lastPlugin.postcssPlugin;
            }
        }

        this.messages.push(data);
    }

    warnings() {
        return this.messages.filter( i => i.type == 'warning' );
    }

}
