import warnOnce from './warn-once';
import Node     from './node';

export default class Declaration extends Node {

    type = 'decl';

    constructor(defaults) {
        super(defaults);
    }

    get _value() {
        warnOnce('Node#_value was deprecated. Use Node#raws.value');
        return this.raws.value;
    }

    set _value(val) {
        warnOnce('Node#_value was deprecated. Use Node#raws.value');
        this.raws.value = val;
    }

    get _important() {
        warnOnce('Node#_important was deprecated. Use Node#raws.important');
        return this.raws.important;
    }

    set _important(val) {
        warnOnce('Node#_important was deprecated. Use Node#raws.important');
        this.raws.important = val;
    }

}
