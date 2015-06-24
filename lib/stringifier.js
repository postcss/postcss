export default {

    stringify(builder, node, semicolon) {
        this[node.type](builder, node, semicolon);
    },

    root(builder, node) {
        this.body(builder, node);
        if ( node.after ) builder(node.after);
    },

    comment(builder, node) {
        let before = node.style('before');
        if ( before ) builder(before);

        let left  = node.style('left',  'commentLeft');
        let right = node.style('right', 'commentRight');
        builder('/*' + left + node.text + right + '*/', node);
    },

    decl(builder, node, semicolon) {
        let before = node.style('before');
        if ( before ) builder(before);

        let between = node.style('between', 'colon');
        let string  = node.prop + between + this.raw(node, 'value');

        if ( node.important ) {
            string += node._important || ' !important';
        }

        if ( semicolon ) string += ';';
        builder(string, node);
    },

    rule(builder, node) {
        this.block(builder, node, this.raw(node, 'selector'));
    },

    atrule(builder, node, semicolon) {
        let name   = '@' + node.name;
        let params = node.params ? this.raw(node, 'params') : '';

        if ( typeof node.afterName !== 'undefined' ) {
            name += node.afterName;
        } else if ( params ) {
            name += ' ';
        }

        if ( node.nodes ) {
            this.block(builder, node, name + params);

        } else {
            let before = node.style('before');
            if ( before ) builder(before);
            let end = (node.between || '') + (semicolon ? ';' : '');
            builder(name + params + end, node);
        }
    },

    body(builder, node) {
        if ( !node.nodes ) return;

        let last = node.nodes.length - 1;
        while ( last > 0 ) {
            if ( node.nodes[last].type !== 'comment' ) break;
            last -= 1;
        }

        let semicolon = node.style('semicolon');
        for ( let i = 0; i < node.nodes.length; i++ ) {
            this.stringify(builder, node.nodes[i], last !== i || semicolon);
        }
    },

    block(builder, node, start) {
        let before = node.style('before');
        if ( before ) builder(before);

        let between = node.style('between', 'beforeOpen');
        builder(start + between + '{', node, 'start');

        let after;
        if ( node.nodes && node.nodes.length ) {
            this.body(builder, node);
            after = node.style('after');
        } else {
            after = node.style('after', 'emptyBody');
        }

        if ( after ) builder(after);
        builder('}', node, 'end');
    },

    raw(node, prop) {
        let value = node[prop];
        let raw   = node['_' + prop];
        if ( raw && raw.value === value ) {
            return raw.raw;
        } else {
            return value;
        }
    }

};
