var Container = require('./container');

// CSS at-rule like “this.keyframes name { }”.
//
// Can contain declarations (like this.font-face or this.page) ot another rules.
class AtRule extends Container {
    constructor(defaults) {
        this.type = 'atrule';
        super(defaults);
    }

    // Different style for this.encoding and this.page at-rules.
    styleType() {
        return this.type + ((this.rules || this.decls) ? '-body' : '-bodiless');
    }

    defaultStyle(type) {
        if ( type == 'atrule-body' ) {
            return { between: ' ', after: this.defaultAfter() };
        } else {
            return { between: '' };
        }
    }

    // Load into at-rule mixin for selected content type
    addMixin(type) {
        var mixin = type == 'rules' ? Container.WithRules : Container.WithDecls;
        if ( !mixin ) return;

        for ( var name in mixin.prototype ) {
            if ( name == 'constructor' ) continue;
            var value = mixin.prototype[name];

            var container = Container.prototype[name] == value;
            var detector  = name == 'append' || name == 'prepend';
            if ( container && !detector ) continue;

            this[name] = value;
        }
        mixin.apply(this);
    }

    // Stringify at-rule
    stringify(builder, last) {
        var style = this.style();

        var name   = '@' + this.name;
        var params = this._params ? this._params.toString() : '';

        if ( typeof(this.afterName) != 'undefined' ) {
            name += this.afterName;
        } else if ( params ) {
            name += ' ';
        }

        if ( this.rules || this.decls ) {
            this.stringifyBlock(builder, name + params + style.between + '{');

        } else {
            if ( this.before ) builder(this.before);
            var semicolon = (!last || this.semicolon) ? ';' : '';
            builder(name + params + style.between + semicolon, this);
        }
    }

    // Hack to detect container type by child type
    append(child) {
        var mixin = child.type == 'decl' ? 'decls' : 'rules';
        this.addMixin(mixin);
        return this.append(child);
    }

    // Hack to detect container type by child type
    prepend(child) {
        var mixin = child.type == 'decl' ? 'decls' : 'rules';
        this.addMixin(mixin);
        return this.prepend(child);
    }
}

AtRule.raw('params');

module.exports = AtRule;
