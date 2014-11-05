var Container   = require('./container');
var Declaration = require('./declaration');
var list        = require('./list');

// CSS rule like “a { }”
class Rule extends Container {
    constructor(defaults) {
        this.type   = 'rule';
        this.childs = [];
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

module.exports = Rule;
