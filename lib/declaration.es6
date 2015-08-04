import warnOnce from './warn-once';
import Node     from './node';

export default class Declaration extends Node {

    constructor(defaults) {
        super(defaults);
        this.type = 'decl';
    }

    get _value() {
        warnOnce('Node#_value was deprecated. Use Node#raw.value');
        return this.raw.value;
    }

    set _value(val) {
        warnOnce('Node#_value was deprecated. Use Node#raw.value');
        this.raw.value = val;
    }

    get _important() {
        warnOnce('Node#_important was deprecated. Use Node#raw.important');
        return this.raw.important;
    }

    set _important(val) {
        warnOnce('Node#_important was deprecated. Use Node#raw.important');
        this.raw.important = val;
    }

}
