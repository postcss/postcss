import Declaration from './declaration';
import Container   from './container';
import list        from './list';

export default class Rule extends Container {
    constructor(defaults) {
        this.type  = 'rule';
        this.nodes = [];
        super(defaults);
    }

    get selectors() {
        return list.comma(this.selector);
    }

    set selectors(values) {
        this.selector = values.join(', ');
    }

    stringify(builder) {
        this.stringifyBlock(builder, this.stringifyRaw('selector'));
    }
}
