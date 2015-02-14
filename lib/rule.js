import Declaration from './declaration';
import Container from './container';
import list from './list';

// CSS rule like “a { }”
export default class Rule extends Container {
    constructor(defaults) {
        this.type  = 'rule';
        this.nodes = [];
        super(defaults);
    }

    // Shortcut to get selectors as array

    get selectors() {
        return list.comma(this.selector);
    }

    set selectors(values) {
        this.selector = values.join(', ');
    }

    // Stringify rule
    stringify(builder) {
        this.stringifyBlock(builder, this.stringifyRaw('selector'));
    }
}
