const defaultStyle = {
    colon:         ': ',
    indent:        '    ',
    beforeDecl:    '\n',
    beforeRule:    '\n',
    beforeOpen:    ' ',
    beforeClose:   '\n',
    beforeComment: '\n',
    after:         '\n',
    emptyBody:     '',
    commentLeft:   ' ',
    commentRight:  ' '
};

function capitalize(str) {
    return str[0].toUpperCase() + str.slice(1);
}

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
        let before = this.style(node, 'before');
        if ( before ) this.builder(before);
        let left  = this.style(node, 'left',  'commentLeft');
        let right = this.style(node, 'right', 'commentRight');
        this.builder('/*' + left + node.text + right + '*/', node);
    }

    decl(node, semicolon) {
        let before = this.style(node, 'before');
        if ( before ) this.builder(before);

        let between = this.style(node, 'between', 'colon');
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
            let before = this.style(node, 'before');
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

        let semicolon = this.style(node, 'semicolon');
        for ( let i = 0; i < node.nodes.length; i++ ) {
            this.stringify(node.nodes[i], last !== i || semicolon);
        }
    }

    block(node, start) {
        let before = this.style(node, 'before');
        if ( before ) this.builder(before);

        let between = this.style(node, 'between', 'beforeOpen');
        this.builder(start + between + '{', node, 'start');

        let after;
        if ( node.nodes && node.nodes.length ) {
            this.body(node);
            after = this.style(node, 'after');
        } else {
            after = this.style(node, 'after', 'emptyBody');
        }

        if ( after ) this.builder(after);
        this.builder('}', node, 'end');
    }

    style(node, own, detect) {
        let value;
        if ( !detect ) detect = own;

        // Already had
        if ( own ) {
            value = node.raw[own];
            if ( typeof value !== 'undefined' ) return value;
        }

        let parent = node.parent;

        // Hack for first rule in CSS
        if ( detect === 'before' ) {
            if ( !parent || parent.type === 'root' && parent.first === node ) {
                return '';
            }
        }

        // Floating child without parent
        if ( !parent ) return defaultStyle[detect];

        // Detect style by other nodes
        let root = node.root();
        if ( !root.styleCache ) root.styleCache = { };
        if ( typeof root.styleCache[detect] !== 'undefined' ) {
            return root.styleCache[detect];
        }

        if ( detect === 'before' || detect === 'after' ) {
            return this.beforeAfter(node, detect);
        } else {
            let method = 'style' + capitalize(detect);
            if ( this[method] ) {
                value = this[method](root, node);
            } else {
                root.eachInside( (i) => {
                    value = i.raw[own];
                    if ( typeof value !== 'undefined' ) return false;
                });
            }
        }

        if ( typeof value === 'undefined' ) value = defaultStyle[detect];

        root.styleCache[detect] = value;
        return value;
    }

    styleSemicolon(root) {
        let value;
        root.eachInside( (i) => {
            if ( i.nodes && i.nodes.length && i.last.type === 'decl' ) {
                value = i.raw.semicolon;
                if ( typeof value !== 'undefined' ) return false;
            }
        });
        return value;
    }

    styleEmptyBody(root) {
        let value;
        root.eachInside( (i) => {
            if ( i.nodes && i.nodes.length === 0 ) {
                value = i.raw.after;
                if ( typeof value !== 'undefined' ) return false;
            }
        });
        return value;
    }

    styleIndent(root) {
        let value;
        root.eachInside( (i) => {
            let p = i.parent;
            if ( p && p !== root && p.parent && p.parent === root ) {
                if ( typeof i.raw.before !== 'undefined' ) {
                    let parts = i.raw.before.split('\n');
                    value = parts[parts.length - 1];
                    value = value.replace(/[^\s]/g, '');
                    return false;
                }
            }
        });
        return value;
    }

    styleBeforeComment(root, node) {
        let value;
        root.eachComment( (i) => {
            if ( typeof i.raw.before !== 'undefined' ) {
                value = i.raw.before;
                if ( value.indexOf('\n') !== -1 ) {
                    value = value.replace(/[^\n]+$/, '');
                }
                return false;
            }
        });
        if ( typeof value === 'undefined' ) {
            value = this.style(node, null, 'beforeDecl');
        }
        return value;
    }

    styleBeforeDecl(root, node) {
        let value;
        root.eachDecl( (i) => {
            if ( typeof i.raw.before !== 'undefined' ) {
                value = i.raw.before;
                if ( value.indexOf('\n') !== -1 ) {
                    value = value.replace(/[^\n]+$/, '');
                }
                return false;
            }
        });
        if ( typeof value === 'undefined' ) {
            value = this.style(node, null, 'beforeRule');
        }
        return value;
    }

    styleBeforeRule(root) {
        let value;
        root.eachInside( (i) => {
            if ( i.nodes && (i.parent !== root || root.first !== i) ) {
                if ( typeof i.raw.before !== 'undefined' ) {
                    value = i.raw.before;
                    if ( value.indexOf('\n') !== -1 ) {
                        value = value.replace(/[^\n]+$/, '');
                    }
                    return false;
                }
            }
        });
        return value;
    }

    styleBeforeClose(root) {
        let value;
        root.eachInside( (i) => {
            if ( i.nodes && i.nodes.length > 0 ) {
                if ( typeof i.raw.after !== 'undefined' ) {
                    value = i.raw.after;
                    if ( value.indexOf('\n') !== -1 ) {
                        value = value.replace(/[^\n]+$/, '');
                    }
                    return false;
                }
            }
        });
        return value;
    }

    styleBeforeOpen(root) {
        let value;
        root.eachInside( (i) => {
            if ( i.type !== 'decl' ) {
                value = i.raw.between;
                if ( typeof value !== 'undefined' ) return false;
            }
        });
        return value;
    }

    styleColon(root) {
        let value;
        root.eachDecl( (i) => {
            if ( typeof i.raw.between !== 'undefined' ) {
                value = i.raw.between.replace(/[^\s:]/g, '');
                return false;
            }
        });
        return value;
    }

    beforeAfter(node, detect) {
        let value;
        if ( node.type === 'decl' ) {
            value = this.style(node, null, 'beforeDecl');
        } else if ( node.type === 'comment' ) {
            value = this.style(node, null, 'beforeComment');
        } else if ( detect === 'before' ) {
            value = this.style(node, null, 'beforeRule');
        } else {
            value = this.style(node, null, 'beforeClose');
        }

        let buf   = node.parent;
        let depth = 0;
        while ( buf && buf.type !== 'root' ) {
            depth += 1;
            buf = buf.parent;
        }

        if ( value.indexOf('\n') !== -1 ) {
            let indent = this.style(node, null, 'indent');
            if ( indent.length ) {
                for ( let step = 0; step < depth; step++ ) value += indent;
            }
        }

        return value;
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
