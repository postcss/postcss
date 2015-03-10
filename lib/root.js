import Container from './container';

export default class Root extends Container {
    constructor(defaults) {
        this.type  = 'root';
        this.nodes = [];
        super(defaults);
    }

    remove(child) {
        child = this.index(child);

        if ( child === 0 && this.nodes.length > 1 ) {
            this.nodes[1].before = this.nodes[child].before;
        }

        return super.remove(child);
    }

    normalize(child, sample, type) {
        let nodes = super.normalize(child);

        if ( sample ) {
            if ( type === 'prepend' ) {
                if ( this.nodes.length > 1 ) {
                    sample.before = this.nodes[1].before;
                } else {
                    delete sample.before;
                }
            } else {
                for ( let node of nodes ) {
                    if ( this.first !== sample ) node.before = sample.before;
                }
            }
        }

        return nodes;
    }

    stringify(builder) {
        this.stringifyContent(builder);
        if ( this.after ) builder(this.after);
    }

    toResult(opts = { }) {
        let LazyResult = require('./lazy-result');
        let Processor  = require('./processor');

        let lazy = new LazyResult(new Processor(), this, opts);
        return lazy.stringify();
    }
}
