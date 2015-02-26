export default class Result {
    constructor(processor, root, opts) {
        this.processor = processor;
        this.root      = root;
        this.opts      = opts;
        this.css       = undefined;
        this.map       = undefined;
    }

    toString() {
        return this.css;
    }

}
