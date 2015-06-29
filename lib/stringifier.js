export default class Stringifier {

    constructor(builder) {
        this.builder = builder;
    }

    stringify(node, semicolon) {
        this[node.type](node, semicolon);
    }

    root(node) {
        this.body(node);
        if ( node.raw.after ) this.builder(node.raw.after);
    }

    comment(node) {
        let before = node.style('before');
        if ( before ) this.builder(before);
        let left  = node.style('left',  'commentLeft');
        let right = node.style('right', 'commentRight');
        this.builder('/*' + left + node.text + right + '*/', node);
    }

    decl(node, semicolon) {
        let before = node.style('before');
        if ( before ) this.builder(before);

        let between = node.style('between', 'colon');
        let string  = node.prop + between + this.raw(node, 'value');

        if ( node.important ) {
            string += node.raw.important || ' !important';
        }

        if ( semicolon ) string += ';';
        this.builder(string, node);
    }

    rule(node) {
        this.block(node, this.raw(node, 'selector'));
    }

    atrule(node, semicolon) {
        let name   = '@' + node.name;
        let params = node.params ? this.raw(node, 'params') : '';

        if ( typeof node.raw.afterName !== 'undefined' ) {
            name += node.raw.afterName;
        } else if ( params ) {
            name += ' ';
        }

        if ( node.nodes ) {
            this.block(node, name + params);

        } else {
            let before = node.style('before');
            if ( before ) this.builder(before);
            let end = (node.raw.between || '') + (semicolon ? ';' : '');
            this.builder(name + params + end, node);
        }
    }

    body(node) {
        if ( !node.nodes ) return;

        let last = node.nodes.length - 1;
        while ( last > 0 ) {
            if ( node.nodes[last].type !== 'comment' ) break;
            last -= 1;
        }

        let semicolon = node.style('semicolon');
        for ( let i = 0; i < node.nodes.length; i++ ) {
            this.stringify(node.nodes[i], last !== i || semicolon);
        }
    }

    block(node, start) {
        let before = node.style('before');
        if ( before ) this.builder(before);

        let between = node.style('between', 'beforeOpen');
        this.builder(start + between + '{', node, 'start');

        let after;
        if ( node.nodes && node.nodes.length ) {
            this.body(node);
            after = node.style('after');
        } else {
            after = node.style('after', 'emptyBody');
        }

        if ( after ) this.builder(after);
        this.builder('}', node, 'end');
    }

    raw(node, prop) {
        let value = node[prop];
        let raw   = node.raw[prop];
        if ( raw && raw.value === value ) {
            return raw.raw;
        } else {
            return value;
        }
    }

}
