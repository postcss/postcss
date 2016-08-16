import CssSyntaxError from '../lib/css-syntax-error';
import Declaration    from '../lib/declaration';
import postcss        from '../lib/postcss';
import AtRule         from '../lib/at-rule';
import parse          from '../lib/parse';
import Root           from '../lib/root';
import Rule           from '../lib/rule';

import path from 'path';
import test from 'ava';

let stringify  = (node, builder) => builder(node.selector);

test('error() generates custom error', t => {
    let file  = path.resolve('a.css');
    let css   = parse('a{}', { from: file });
    let error = css.first.error('Test');
    t.truthy(error instanceof CssSyntaxError);
    t.deepEqual(error.message, file + ':1:1: Test');
});

test('error() generates custom error for nodes without source', t => {
    let rule  = new Rule({ selector: 'a' });
    let error = rule.error('Test');
    t.deepEqual(error.message, '<css input>: Test');
});

test('error() highlights index', t => {
    let root  = parse('a { b: c }');
    let error = root.first.first.error('Bad semicolon', { index: 1 });
    t.deepEqual(error.showSourceCode(false), '> 1 | a { b: c }\n' +
                                             '    |      ^');
});

test('error() highlights word', t => {
    let root  = parse('a { color: x red }');
    let error = root.first.first.error('Wrong color', { word: 'x' });
    t.deepEqual(error.showSourceCode(false), '> 1 | a { color: x red }\n' +
                                             '    |            ^');
});

test('error() highlights word in multiline string', t => {
    let root  = parse('a { color: red\n           x }');
    let error = root.first.first.error('Wrong color', { word: 'x' });
    t.deepEqual(error.showSourceCode(false), '  1 | a { color: red\n' +
                                             '> 2 |            x }\n' +
                                             '    |            ^');
});

test('warn() attaches a warning to the result object', t => {
    let warning;
    let warner = postcss.plugin('warner', () => {
        return (css, result) => {
            warning = css.first.warn(result, 'FIRST!');
        };
    });

    return postcss([warner]).process('a{}').then(result => {
        t.deepEqual(warning.type,   'warning');
        t.deepEqual(warning.text,   'FIRST!');
        t.deepEqual(warning.plugin, 'warner');
        t.deepEqual(result.warnings(), [warning]);
    });
});

test('warn() accepts options', t => {
    let warner = postcss.plugin('warner', () => {
        return (css, result) => {
            css.first.warn(result, 'FIRST!', { index: 1 });
        };
    });

    let result = postcss([ warner() ]).process('a{}');
    t.deepEqual(result.warnings().length,  1);
    t.deepEqual(result.warnings()[0].index, 1);
});

test('remove() emoves node from parent', t => {
    let rule = new Rule({ selector: 'a' });
    let decl = new Declaration({ prop: 'color', value: 'black' });
    rule.append(decl);

    decl.remove();
    t.deepEqual(rule.nodes.length, 0);
    t.deepEqual(typeof decl.parent, 'undefined');
});

test('replaceWith() inserts new node', t => {
    let rule = new Rule({ selector: 'a' });
    rule.append({ prop: 'color', value: 'black' });
    rule.append({ prop: 'width', value: '1px' });
    rule.append({ prop: 'height', value: '1px' });

    let node   = new Declaration({ prop: 'min-width', value: '1px' });
    let width  = rule.nodes[1];
    let result = width.replaceWith(node);

    t.deepEqual(result, width);
    t.deepEqual(rule.toString(), 'a {\n' +
                                 '    color: black;\n' +
                                 '    min-width: 1px;\n' +
                                 '    height: 1px\n' +
                                 '}');
});

test('replaceWith() inserts new root', t => {
    let root = new Root();
    root.append( new AtRule({ name: 'import', params: '"a.css"' }) );

    let a = new Root();
    a.append( new Rule({ selector: 'a' }) );
    a.append( new Rule({ selector: 'b' }) );

    root.first.replaceWith(a);
    t.deepEqual(root.toString(), 'a {}\nb {}');
});

test('replaceWith() replaces node', t => {
    let css    = parse('a{one:1;two:2}');
    let decl   = { prop: 'fix', value: 'fixed' };
    let result = css.first.first.replaceWith(decl);

    t.deepEqual(result.prop, 'one');
    t.deepEqual(typeof result.parent, 'undefined');
    t.deepEqual(css.toString(), 'a{fix:fixed;two:2}');
});

test('toString() accepts custom stringifier', t => {
    t.deepEqual(new Rule({ selector: 'a' }).toString(stringify), 'a');
});

test('toString() accepts custom syntax', t => {
    t.deepEqual(new Rule({ selector: 'a' }).toString({ stringify }), 'a');
});

test('clone() clones nodes', t => {
    let rule = new Rule({ selector: 'a' });
    rule.append({ prop: 'color', value: '/**/black' });

    let clone = rule.clone();

    t.deepEqual(typeof clone.parent, 'undefined');

    t.is(rule.first.parent, rule);
    t.is(clone.first.parent, clone);

    clone.append({ prop: 'z-index', value: '1' });
    t.deepEqual(rule.nodes.length, 1);
});

test('clone() overrides properties', t => {
    let rule  = new Rule({ selector: 'a' });
    let clone = rule.clone({ selector: 'b' });
    t.deepEqual(clone.selector, 'b');
});

test('clone() cleans code style', t => {
    let css = parse('@page 1{a{color:black;}}');
    t.deepEqual(css.clone().toString(), '@page 1 {\n' +
                                        '    a {\n' +
                                        '        color: black\n' +
                                        '    }\n' +
                                        '}');
});

test('clone() works with null in raws', t => {
    let decl = new Declaration({
        prop:  'color',
        value: 'black',
        raws:  { value: null }
    });
    let clone = decl.clone();
    t.deepEqual(Object.keys(clone.raws), ['value']);
});

test('cloneBefore() clones and insert before current node', t => {
    let rule = new Rule({ selector: 'a', raws: { after: '' } });
    rule.append({ prop: 'z-index', value: '1', raws: { before: '' } });

    let result = rule.first.cloneBefore({ value: '2' });

    t.is(result, rule.first);
    t.deepEqual(rule.toString(), 'a {z-index: 2;z-index: 1}');
});

test('cloneAfter() clones and insert after current node', t => {
    let rule = new Rule({ selector: 'a', raws: { after: '' } });
    rule.append({ prop: 'z-index', value: '1', raws: { before: '' } });

    let result = rule.first.cloneAfter({ value: '2' });

    t.is(result, rule.last);
    t.deepEqual(rule.toString(), 'a {z-index: 1;z-index: 2}');
});

test('next() returns next node', t => {
    let css = parse('a{one:1;two:2}');
    t.is(css.first.first.next(), css.first.last);
    t.deepEqual(typeof css.first.last.next(), 'undefined');
});

test('prev() returns previous node', t => {
    let css = parse('a{one:1;two:2}');
    t.is(css.first.last.prev(), css.first.first);
    t.deepEqual(typeof css.first.first.prev(), 'undefined');
});

test('moveTo() moves node between roots', t => {
    let css1 = parse('a{one:1}b{two:2}');
    let css2 = parse('c {\n thr: 3\n}');
    css1.first.moveTo(css2);

    t.deepEqual(css1.toString(), 'b{two:2}');
    t.deepEqual(css2.toString(), 'c {\n thr: 3\n}\na {\n one: 1\n}');
});

test('moveTo() moves node inside one root', t => {
    let css = parse('a{\n one:1}\n@page {\n b {\n  two: 2\n }\n}');
    css.first.moveTo(css.last);

    t.deepEqual(css.toString(),
               '@page {\n b {\n  two: 2\n }\n a{\n  one:1\n }\n}');
});

test('moveBefore() moves node between roots', t => {
    let css1 = parse('a{one:1}b{two:2}');
    let css2 = parse('c {\n thr: 3\n}');
    css1.first.moveBefore(css2.first);

    t.deepEqual(css1.toString(), 'b{two:2}');
    t.deepEqual(css2.toString(), 'a {\n one: 1\n}\nc {\n thr: 3\n}');
});

test('moveBefore() moves node inside one root', t => {
    let css = parse('a{\n one:1}\n@page {\n b {\n  two: 2\n }\n}');
    css.first.moveBefore(css.last.first);

    t.deepEqual(css.toString(),
                '@page {\n a{\n  one:1\n }\n b {\n  two: 2\n }\n}');
});

test('moveAfter() moves node between roots', t => {
    let css1 = parse('a{one:1}b{two:2}');
    let css2 = parse('c {\n thr: 3\n}');
    css1.first.moveAfter(css2.first);

    t.deepEqual(css1.toString(), 'b{two:2}');
    t.deepEqual(css2.toString(), 'c {\n thr: 3\n}\na {\n one: 1\n}');
});

test('moveAfter() moves node inside one root', t => {
    let css = parse('a{\n one:1}\n@page {\n b {\n  two: 2\n }\n}');
    css.first.moveAfter(css.last.first);

    t.deepEqual(css.toString(),
               '@page {\n b {\n  two: 2\n }\n a{\n  one:1\n }\n}');
});

test('toJSON() cleans parents inside', t => {
    let rule = new Rule({ selector: 'a' });
    rule.append({ prop: 'color', value: 'b' });

    let json = rule.toJSON();
    t.deepEqual(typeof json.parent, 'undefined');
    t.deepEqual(typeof json.nodes[0].parent, 'undefined');

    t.deepEqual(JSON.stringify(rule),
        '{"raws":{},"selector":"a","type":"rule","nodes":[' +
            '{"raws":{},"prop":"color","value":"b","type":"decl"}' +
        ']}');
});

test('toJSON() converts custom properties', t => {
    let root = new Root();
    root._cache = [1];
    root._hack = {
        toJSON() {
            return 'hack';
        }
    };

    t.deepEqual(root.toJSON(), {
        type:   'root',
        nodes:  [],
        raws:   { },
        _hack:  'hack',
        _cache: [1]
    });
});

test('raw() has shortcut to stringifier', t => {
    let rule = new Rule({ selector: 'a' });
    t.deepEqual(rule.raw('before'), '');
});

test('root() returns root', t => {
    let css = parse('@page{a{color:black}}');
    t.is(css.first.first.first.root(), css);
});

test('root() returns parent of parents', t => {
    let rule = new Rule({ selector: 'a' });
    rule.append({ prop: 'color', value: 'black' });
    t.is(rule.first.root(), rule);
});

test('root() returns self on root', t => {
    let rule = new Rule({ selector: 'a' });
    t.is(rule.root(), rule);
});

test('cleanRaws() cleans style recursivelly', t => {
    let css = parse('@page{a{color:black}}');
    css.cleanRaws();

    t.deepEqual(css.toString(),
                '@page {\n    a {\n        color: black\n    }\n}');
    t.deepEqual(typeof css.first.raws.before,              'undefined');
    t.deepEqual(typeof css.first.first.first.raws.before,  'undefined');
    t.deepEqual(typeof css.first.raws.between,             'undefined');
    t.deepEqual(typeof css.first.first.first.raws.between, 'undefined');
    t.deepEqual(typeof css.first.raws.after,               'undefined');
});

test('cleanRaws() keeps between on request', t => {
    let css = parse('@page{a{color:black}}');
    css.cleanRaws(true);

    t.deepEqual(css.toString(),
                '@page{\n    a{\n        color:black\n    }\n}');
    t.deepEqual(typeof css.first.raws.between,             'string');
    t.deepEqual(typeof css.first.first.first.raws.between, 'string');
    t.deepEqual(typeof css.first.raws.before,              'undefined');
    t.deepEqual(typeof css.first.first.first.raws.before,  'undefined');
    t.deepEqual(typeof css.first.raws.after,               'undefined');
});

test('positionInside() returns position when node starts mid-line', t => {
    let css = parse('a {  one: X  }');
    let one = css.first.first;
    t.deepEqual(one.positionInside(6), { line: 1, column: 12 });
});

test('positionInside() returns position when before contains newline', t => {
    let css = parse('a {\n  one: X}');
    let one = css.first.first;
    t.deepEqual(one.positionInside(6), { line: 2, column: 9 });
});

test('positionInside() returns position when node contains newlines', t => {
    let css = parse('a {\n\tone: 1\n\t\tX\n3}');
    let one = css.first.first;
    t.deepEqual(one.positionInside(10), { line: 3, column: 4 });
});
