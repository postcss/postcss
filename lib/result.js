// Object with processed CSS
export default class Result {
    constructor(processor, root, opts) {
        this.processor = processor;
        this.root      = root;
        this.opts      = opts;
        this.css       = undefined;
        this.map       = undefined;
    }

    // Return CSS string on any try to print
    toString() {
        return this.css;
    }

}
