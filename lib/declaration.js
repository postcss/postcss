import warnOnce from './warn-once';
import Node     from './node';

export default class Declaration extends Node {

    constructor(defaults) {
        super(defaults);
        this.type = 'decl';
    }

    get _important() {
        warnOnce('Node#_important was deprecated. Use Node#raw.important');
        return this.raw.important;
    }

    set _important(val) {
        warnOnce('Node#_important was deprecated. Use Node#raw.important');
        return this.raw.important = val;
    }

}
