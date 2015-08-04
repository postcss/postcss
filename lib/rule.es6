import Container from './container';
import warnOnce  from './warn-once';
import list      from './list';

export default class Rule extends Container {

    constructor(defaults) {
        super(defaults);
        if ( !this.nodes ) this.nodes = [];
        this.type = 'rule';
    }

    get selectors() {
        return list.comma(this.selector);
    }

    set selectors(values) {
        let match = this.selector.match(/,\s*/);
        let sep = match ? match[0] : ',' + this.style('between', 'beforeOpen');
        this.selector = values.join(sep);
    }

    get _selector() {
        warnOnce('Rule#_selector was deprecated. Use Rule#raw.selector');
        return this.raw.selector;
    }

    set _selector(val) {
        warnOnce('Rule#_selector was deprecated. Use Rule#raw.selector');
        this.raw.selector = val;
    }

}
