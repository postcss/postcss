import Declaration from '../lib/declaration';
import parse       from '../lib/parse';
import Rule        from '../lib/rule';
import Root        from '../lib/root';

import test from 'ava';

let example = 'a { a: 1; b: 2 }' +
              '/* a */' +
              '@keyframes anim {' +
                  '/* b */' +
                  'to { c: 3 }' +
              '}' +
              '@media all and (min-width: 100) {' +
                  'em { d: 4 }' +
                  '@page {' +
                       'e: 5;' +
                      '/* c */' +
                  '}' +
              '}';

test('throws error on declaration without value', t => {
    t.throws( () => {
        (new Rule()).append({ prop: 'color', vlaue: 'black' });
    }, /Value field is missed/);
});

test('throws error on unknown node type', t => {
    t.throws( () => {
        (new Rule()).append({ foo: 'bar' });
    }, /Unknown node type/);
});

test('push() adds child without checks', t => {
    let rule = parse('a { a: 1; b: 2 }').first;
    rule.push(new Declaration({ prop: 'c', value: '3' }));
    t.deepEqual(rule.toString(), 'a { a: 1; b: 2; c: 3 }');
    t.deepEqual(rule.nodes.length, 3);
    t.deepEqual(typeof rule.last.raws.before, 'undefined');
});

test('each() iterates', t => {
    let rule    = parse('a { a: 1; b: 2 }').first;
    let indexes = [];

    let result = rule.each( (decl, i) => {
        indexes.push(i);
        t.is(decl, rule.nodes[i]);
    });

    t.deepEqual(typeof result, 'undefined');
    t.deepEqual(indexes, [0, 1]);
});

test('each() iterates with prepend', t => {
    let rule = parse('a { a: 1; b: 2 }').first;
    let size = 0;

    rule.each( () => {
        rule.prepend({ prop: 'color', value: 'aqua' });
        size += 1;
    });

    t.deepEqual(size, 2);
});

test('each() iterates with prepend insertBefore', t => {
    let rule = parse('a { a: 1; b: 2 }').first;
    let size = 0;

    rule.each( decl => {
        if ( decl.prop === 'a' ) {
            rule.insertBefore(decl, { prop: 'c', value: '3' });
        }
        size += 1;
    });

    t.deepEqual(size, 2);
});

test('each() iterates with append insertBefore', t => {
    let rule = parse('a { a: 1; b: 2 }').first;
    let size = 0;

    rule.each( (decl, i) => {
        if ( decl.prop === 'a' ) {
            rule.insertBefore(i + 1, { prop: 'c', value: '3' });
        }
        size += 1;
    });

    t.deepEqual(size, 3);
});

test('each() iterates with prepend insertAfter', t => {
    let rule = parse('a { a: 1; b: 2 }').first;
    let size = 0;

    rule.each( (decl, i) => {
        rule.insertAfter(i - 1, { prop: 'c', value: '3' });
        size += 1;
    });

    t.deepEqual(size, 2);
});

test('each() iterates with append insertAfter', t => {
    let rule = parse('a { a: 1; b: 2 }').first;
    let size = 0;

    rule.each( (decl, i) => {
        if ( decl.prop === 'a' ) {
            rule.insertAfter(i, { prop: 'c', value: '3' });
        }
        size += 1;
    });

    t.deepEqual(size, 3);
});

test('each() iterates with remove', t => {
    let rule = parse('a { a: 1; b: 2 }').first;
    let size = 0;

    rule.each( () => {
        rule.removeChild(0);
        size += 1;
    });

    t.deepEqual(size, 2);
});

test('each() breaks iteration', t => {
    let rule    = parse('a { a: 1; b: 2 }').first;
    let indexes = [];

    let result = rule.each( (decl, i) => {
        indexes.push(i);
        return false;
    });

    t.false(result);
    t.deepEqual(indexes, [0]);
});

test('each() allows to change children', t => {
    let rule  = parse('a { a: 1; b: 2 }').first;
    let props = [];

    rule.each( decl => {
        props.push(decl.prop);
        rule.nodes = [rule.last, rule.first];
    });

    t.deepEqual(props, ['a', 'a']);
});

test('walk() iterates', t => {
    let types   = [];
    let indexes = [];

    let result = parse(example).walk( (node, i) => {
        types.push(node.type);
        indexes.push(i);
    });

    t.deepEqual(typeof result, 'undefined');
    t.deepEqual(types, [
        'rule', 'decl', 'decl', 'comment', 'atrule', 'comment', 'rule', 'decl',
        'atrule', 'rule', 'decl', 'atrule', 'decl', 'comment'
    ]);
    t.deepEqual(indexes, [0, 0, 1, 1, 2, 0, 1, 0, 3, 0, 0, 1, 0, 1]);
});

test('walk() breaks iteration', t => {
    let indexes = [];

    let result = parse(example).walk( (decl, i) => {
        indexes.push(i);
        return false;
    });

    t.false(result);
    t.deepEqual(indexes, [0]);
});

test('walkDecls() iterates', t => {
    let props   = [];
    let indexes = [];

    let result = parse(example).walkDecls( (decl, i) => {
        props.push(decl.prop);
        indexes.push(i);
    });

    t.deepEqual(typeof result, 'undefined');
    t.deepEqual(props, ['a', 'b', 'c', 'd', 'e']);
    t.deepEqual(indexes, [0, 1, 0, 0, 0]);
});

test('walkDecls() iterates with changes', t => {
    let size = 0;
    parse(example).walkDecls( (decl, i) => {
        decl.parent.removeChild(i);
        size += 1;
    });
    t.deepEqual(size, 5);
});

test('walkDecls() breaks iteration', t => {
    let indexes = [];

    let result = parse(example).walkDecls( (decl, i) => {
        indexes.push(i);
        return false;
    });

    t.false(result);
    t.deepEqual(indexes, [0]);
});

test('walkDecls() filters declarations by property name', t => {
    let css  = parse('@page{a{one:1}}b{one:1;two:2}');
    let size = 0;

    css.walkDecls('one', decl => {
        t.deepEqual(decl.prop, 'one');
        size += 1;
    });

    t.deepEqual(size, 2);
});

test('walkDecls() breaks declarations filter by name', t => {
    let css  = parse('@page{a{one:1}}b{one:1;two:2}');
    let size = 0;

    css.walkDecls('one', () => {
        size += 1;
        return false;
    });

    t.deepEqual(size, 1);
});

test('walkDecls() filters declarations by property regexp', t => {
    let css  = parse('@page{a{one:1}}b{one-x:1;two:2}');
    let size = 0;

    css.walkDecls(/one(-x)?/, () => {
        size += 1;
    });

    t.deepEqual(size, 2);
});

test('walkDecls() breaks declarations filters by regexp', t => {
    let css  = parse('@page{a{one:1}}b{one-x:1;two:2}');
    let size = 0;

    css.walkDecls(/one(-x)?/, () => {
        size += 1;
        return false;
    });

    t.deepEqual(size, 1);
});

test('walkComments() iterates', t => {
    let texts   = [];
    let indexes = [];

    let result = parse(example).walkComments( (comment, i) => {
        texts.push(comment.text);
        indexes.push(i);
    });

    t.deepEqual(typeof result, 'undefined');
    t.deepEqual(texts,   ['a', 'b', 'c']);
    t.deepEqual(indexes, [1, 0, 1]);
});

test('walkComments() iterates with changes', t => {
    let size = 0;
    parse(example).walkComments( (comment, i) => {
        comment.parent.removeChild(i);
        size += 1;
    });
    t.deepEqual(size, 3);
});

test('walkComments() breaks iteration', t => {
    let indexes = [];

    let result = parse(example).walkComments( (comment, i) => {
        indexes.push(i);
        return false;
    });

    t.false(result);
    t.deepEqual(indexes, [1]);
});

test('walkRules() iterates', t => {
    let selectors = [];
    let indexes   = [];

    let result = parse(example).walkRules( (rule, i) => {
        selectors.push(rule.selector);
        indexes.push(i);
    });

    t.deepEqual(typeof result, 'undefined');
    t.deepEqual(selectors, ['a', 'to', 'em']);
    t.deepEqual(indexes, [0, 1, 0]);
});

test('walkRules() iterates with changes', t => {
    let size = 0;
    parse(example).walkRules( (rule, i) => {
        rule.parent.removeChild(i);
        size += 1;
    });
    t.deepEqual(size, 3);
});

test('walkRules() breaks iteration', t => {
    let indexes = [];

    let result = parse(example).walkRules( (rule, i) => {
        indexes.push(i);
        return false;
    });

    t.false(result);
    t.deepEqual(indexes, [0]);
});

test('walkRules() filters by selector', t => {
    let size = 0;
    parse('a{}b{}a{}').walkRules('a', rule => {
        t.deepEqual(rule.selector, 'a');
        size += 1;
    });
    t.deepEqual(size, 2);
});

test('walkRules() breaks selector filters', t => {
    let size = 0;
    parse('a{}b{}a{}').walkRules('a', () => {
        size += 1;
        return false;
    });
    t.deepEqual(size, 1);
});

test('walkRules() filters by regexp', t => {
    let size = 0;
    parse('a{}a b{}b a{}').walkRules(/^a/, rule => {
        t.regex(rule.selector, /^a/);
        size += 1;
    });
    t.deepEqual(size, 2);
});

test('walkRules() breaks selector regexp', t => {
    let size = 0;
    parse('a{}b a{}b a{}').walkRules(/^a/, () => {
        size += 1;
        return false;
    });
    t.deepEqual(size, 1);
});

test('walkAtRules() iterates', t => {
    let names   = [];
    let indexes = [];

    let result = parse(example).walkAtRules( (atrule, i) => {
        names.push(atrule.name);
        indexes.push(i);
    });

    t.deepEqual(typeof result, 'undefined');
    t.deepEqual(names, ['keyframes', 'media', 'page']);
    t.deepEqual(indexes, [2, 3, 1]);
});

test('walkAtRules() iterates with changes', t => {
    let size = 0;
    parse(example).walkAtRules( (atrule, i) => {
        atrule.parent.removeChild(i);
        size += 1;
    });
    t.deepEqual(size, 3);
});

test('walkAtRules() breaks iteration', t => {
    let indexes = [];

    let result = parse(example).walkAtRules( (atrule, i) => {
        indexes.push(i);
        return false;
    });

    t.false(result);
    t.deepEqual(indexes, [2]);
});

test('walkAtRules() filters at-rules by name', t => {
    let css  = parse('@page{@page 2{}}@media print{@page{}}');
    let size = 0;

    css.walkAtRules('page', atrule => {
        t.deepEqual(atrule.name, 'page');
        size += 1;
    });

    t.deepEqual(size, 3);
});

test('walkAtRules() breaks name filter', t => {
    let size = 0;
    parse('@page{@page{@page{}}}').walkAtRules('page', () => {
        size += 1;
        return false;
    });
    t.deepEqual(size, 1);
});

test('walkAtRules() filters at-rules by name regexp', t => {
    let css  = parse('@page{@page 2{}}@media print{@pages{}}');
    let size = 0;

    css.walkAtRules(/page/, () => {
        size += 1;
    });

    t.deepEqual(size, 3);
});

test('walkAtRules() breaks regexp filter', t => {
    let size = 0;
    parse('@page{@pages{@page{}}}').walkAtRules(/page/, () => {
        size += 1;
        return false;
    });
    t.deepEqual(size, 1);
});

test('append() appends child', t => {
    let rule = parse('a { a: 1; b: 2 }').first;
    rule.append({ prop: 'c', value: '3' });
    t.deepEqual(rule.toString(), 'a { a: 1; b: 2; c: 3 }');
    t.deepEqual(rule.last.raws.before, ' ');
});

test('append() appends multiple children', t => {
    let rule = parse('a { a: 1; b: 2 }').first;
    rule.append({ prop: 'c', value: '3' }, { prop: 'd', value: '4' });
    t.deepEqual(rule.toString(), 'a { a: 1; b: 2; c: 3; d: 4 }');
    t.deepEqual(rule.last.raws.before, ' ');
});

test('append() has declaration shortcut', t => {
    let rule = parse('a { a: 1; b: 2 }').first;
    rule.append({ prop: 'c', value: '3' });
    t.deepEqual(rule.toString(), 'a { a: 1; b: 2; c: 3 }');
});

test('append() has rule shortcut', t => {
    let root = new Root();
    root.append({ selector: 'a' });
    t.deepEqual(root.first.toString(), 'a {}');
});

test('append() has at-rule shortcut', t => {
    let root = new Root();
    root.append({ name: 'encoding', params: '"utf-8"' });
    t.deepEqual(root.first.toString(), '@encoding "utf-8"');
});

test('append() has comment shortcut', t => {
    let root = new Root();
    root.append({ text: 'ok' });
    t.deepEqual(root.first.toString(), '/* ok */');
});

test('append() receives root', t => {
    let css = parse('a {}');
    css.append( parse('b {}') );
    t.deepEqual(css.toString(), 'a {}\nb {}');
});

test('append() reveives string', t => {
    let root = new Root();
    root.append('a{}b{}');
    root.first.append('color:black');
    t.deepEqual(root.toString(), 'a {\n    color: black\n}\nb {}');
    t.deepEqual(typeof root.first.first.source, 'undefined');
});

test('append() receives array', t => {
    let a = parse('a{ z-index: 1 }');
    let b = parse('b{width:1px;height:2px}');

    a.first.append( b.first.nodes );
    t.deepEqual(a.toString(), 'a{ z-index: 1; width: 1px; height: 2px }');
    t.deepEqual(b.toString(), 'b{width:1px;height:2px}');
});

test('append() clones node on insert', t => {
    let a = parse('a{}');
    let b = parse('b{}');

    b.append(a.first);
    b.last.selector = 'b a';

    t.deepEqual(a.toString(), 'a{}');
    t.deepEqual(b.toString(), 'b{}\nb a{}');
});

test('prepend() prepends child', t => {
    let rule = parse('a { a: 1; b: 2 }').first;
    rule.prepend({ prop: 'c', value: '3' });
    t.deepEqual(rule.toString(), 'a { c: 3; a: 1; b: 2 }');
    t.deepEqual(rule.first.raws.before, ' ');
});

test('prepend() prepends multiple children', t => {
    let rule = parse('a { a: 1; b: 2 }').first;
    rule.prepend({ prop: 'c', value: '3' }, { prop: 'd', value: '4' });
    t.deepEqual(rule.toString(), 'a { c: 3; d: 4; a: 1; b: 2 }');
    t.deepEqual(rule.first.raws.before, ' ');
});

test('prepend() receive hash instead of declaration', t => {
    let rule = parse('a { a: 1; b: 2 }').first;
    rule.prepend({ prop: 'c', value: '3' });
    t.deepEqual(rule.toString(), 'a { c: 3; a: 1; b: 2 }');
});

test('prepend() receives root', t => {
    let css = parse('a {}');
    css.prepend( parse('b {}') );
    t.deepEqual(css.toString(), 'b {}\na {}');
});

test('prepend() receives root', t => {
    let css = parse('a {}');
    css.prepend('b {}');
    t.deepEqual(css.toString(), 'b {}\na {}');
});

test('prepend() receives array', t => {
    let a = parse('a{ z-index: 1 }');
    let b = parse('b{width:1px;height:2px}');

    a.first.prepend( b.first.nodes );
    t.deepEqual(a.toString(), 'a{ width: 1px; height: 2px; z-index: 1 }');
});

test('prepend() works on empty container', t => {
    let root = parse('');
    root.prepend( new Rule({ selector: 'a' }) );
    t.deepEqual(root.toString(), 'a {}');
});

test('insertBefore() inserts child', t => {
    let rule = parse('a { a: 1; b: 2 }').first;
    rule.insertBefore(1, { prop: 'c', value: '3' });
    t.deepEqual(rule.toString(), 'a { a: 1; c: 3; b: 2 }');
    t.deepEqual(rule.nodes[1].raws.before, ' ');
});

test('insertBefore() works with nodes too', t => {
    let rule = parse('a { a: 1; b: 2 }').first;
    rule.insertBefore(rule.nodes[1], { prop: 'c', value: '3' });
    t.deepEqual(rule.toString(), 'a { a: 1; c: 3; b: 2 }');
});

test('insertBefore() receive hash instead of declaration', t => {
    let rule = parse('a { a: 1; b: 2 }').first;
    rule.insertBefore(1, { prop: 'c', value: '3' });
    t.deepEqual(rule.toString(), 'a { a: 1; c: 3; b: 2 }');
});

test('insertBefore() receives array', t => {
    let a = parse('a{ color: red; z-index: 1 }');
    let b = parse('b{width:1;height:2}');

    a.first.insertBefore(1, b.first.nodes);
    t.deepEqual(a.toString(),
                'a{ color: red; width: 1; height: 2; z-index: 1 }');
});

test('insertAfter() inserts child', t => {
    let rule = parse('a { a: 1; b: 2 }').first;
    rule.insertAfter(0, { prop: 'c', value: '3' });
    t.deepEqual(rule.toString(), 'a { a: 1; c: 3; b: 2 }');
    t.deepEqual(rule.nodes[1].raws.before, ' ');
});

test('insertAfter() works with nodes too', t => {
    let rule = parse('a { a: 1; b: 2 }').first;
    rule.insertAfter(rule.first, { prop: 'c', value: '3' });
    t.deepEqual(rule.toString(), 'a { a: 1; c: 3; b: 2 }');
});

test('insertAfter() receive hash instead of declaration', t => {
    let rule = parse('a { a: 1; b: 2 }').first;
    rule.insertAfter(0, { prop: 'c', value: '3' });
    t.deepEqual(rule.toString(), 'a { a: 1; c: 3; b: 2 }');
});

test('insertAfter() receives array', t => {
    let a = parse('a{ color: red; z-index: 1 }');
    let b = parse('b{width:1;height:2}');

    a.first.insertAfter(0, b.first.nodes);
    t.deepEqual(a.toString(),
                'a{ color: red; width: 1; height: 2; z-index: 1 }');
});

test('removeChild() removes by index', t => {
    let rule = parse('a { a: 1; b: 2 }').first;
    rule.removeChild(1);
    t.deepEqual(rule.toString(), 'a { a: 1 }');
});

test('removeChild() removes by node', t => {
    let rule = parse('a { a: 1; b: 2 }').first;
    rule.removeChild(rule.last);
    t.deepEqual(rule.toString(), 'a { a: 1 }');
});

test('removeChild() cleans parent in removed node', t => {
    let rule = parse('a { a: 1; b: 2 }').first;
    let decl = rule.first;
    rule.removeChild(decl);
    t.deepEqual(typeof decl.parent, 'undefined');
});

test('removeAll() removes all children', t => {
    let rule = parse('a { a: 1; b: 2 }').first;
    let decl = rule.first;
    rule.removeAll();

    t.deepEqual(typeof decl.parent, 'undefined');
    t.deepEqual(rule.toString(), 'a { }');
});

test('replaceValues() replaces strings', t => {
    let css    = parse('a{one:1}b{two:1 2}');
    let result = css.replaceValues('1', 'A');

    t.deepEqual(result, css);
    t.deepEqual(css.toString(), 'a{one:A}b{two:A 2}');
});

test('replaceValues() replaces regpexp', t => {
    let css = parse('a{one:1}b{two:1 2}');
    css.replaceValues(/\d/g, i => i + 'A');
    t.deepEqual(css.toString(), 'a{one:1A}b{two:1A 2A}');
});

test('replaceValues() filters properties', t => {
    let css = parse('a{one:1}b{two:1 2}');
    css.replaceValues('1', { props: ['one'] }, 'A');
    t.deepEqual(css.toString(), 'a{one:A}b{two:1 2}');
});

test('replaceValues() uses fast check', t => {
    let css = parse('a{one:1}b{two:1 2}');
    css.replaceValues('1', { fast: '2' }, 'A');
    t.deepEqual(css.toString(), 'a{one:1}b{two:A 2}');
});

test('any() return true if all children return true', t => {
    let rule = parse('a { a: 1; b: 2 }').first;
    t.true(rule.every( i => i.prop.match(/a|b/) ));
    t.false(rule.every( i => i.prop.match(/b/) ));
});

test('some() return true if all children return true', t => {
    let rule = parse('a { a: 1; b: 2 }').first;
    t.true(rule.some( i => i.prop === 'b' ));
    t.false(rule.some( i => i.prop === 'c' ));
});

test('index() returns child index', t => {
    let rule = parse('a { a: 1; b: 2 }').first;
    t.deepEqual(rule.index( rule.nodes[1] ), 1);
});

test('index() returns argument if it(is number', t => {
    let rule = parse('a { a: 1; b: 2 }').first;
    t.deepEqual(rule.index(2), 2);
});

test('returns first child', t => {
    let rule = parse('a { a: 1; b: 2 }').first;
    t.deepEqual(rule.first.prop, 'a');
});

test('returns last child', t => {
    let rule = parse('a { a: 1; b: 2 }').first;
    t.deepEqual(rule.last.prop, 'b');
});

test('normalize() does not normalize new children with exists before', t => {
    let rule = parse('a { a: 1; b: 2 }').first;
    rule.append({ prop: 'c', value: '3', raws: { before: '\n ' } });
    t.deepEqual(rule.toString(), 'a { a: 1; b: 2;\n c: 3 }');
});

test('forces Declaration#value to be string', t => {
    let rule = parse('a { a: 1; b: 2 }').first;
    rule.append({ prop: 'c', value: 3 });
    t.deepEqual(typeof rule.first.value, 'string');
    t.deepEqual(typeof rule.last.value,  'string');
});
