import Container from './container';
import warnOnce  from './warn-once';
import list      from './list';

export default class Rule extends Container {

    type = 'rule'

    constructor(defaults) {
        super(defaults);
        if ( !this.nodes ) this.nodes = [];
    }

    get selectors() {
        return list.comma(this.selector);
    }

    set selectors(values) {
        let match = this.selector.match(/,\s*/);
        let sep = match ? match[0] : ',' + this.raw('between', 'beforeOpen');
        this.selector = values.join(sep);
    }

    get _selector() {
        warnOnce('Rule#_selector is deprecated. Use Rule#raws.selector');
        return this.raws.selector;
    }

    set _selector(val) {
        warnOnce('Rule#_selector is deprecated. Use Rule#raws.selector');
        this.raws.selector = val;
    }

}
