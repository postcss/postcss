import path from 'path';

function clean(node) {
    delete node.source.input.css;
    node.source.input.file = path.basename(node.source.input.file);
    node.source.input.from = path.basename(node.source.input.from);

    if ( node.nodes ) {
        node.nodes = node.nodes.map( i => clean(i) );
    }

    return node;
}

export default function jsonify(node) {
    return clean(node.toJSON());
}
