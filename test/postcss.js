import Processor from '../lib/processor';
import postcss   from '../lib/postcss';

import test from 'ava';

test('creates plugins list', t => {
    let processor = postcss();
    t.truthy(processor instanceof Processor);
    t.deepEqual(processor.plugins, []);
});

test('saves plugins list', t => {
    let a = () => 1;
    let b = () => 2;
    t.deepEqual(postcss(a, b).plugins, [a, b]);
});

test('saves plugins list as array', t => {
    let a = () => 1;
    let b = () => 2;
    t.deepEqual(postcss([a, b]).plugins, [a, b]);
});

test('takes plugin from other processor', t => {
    let a = () => 1;
    let b = () => 2;
    let c = () => 3;
    let other = postcss([a, b]);
    t.deepEqual(postcss([other, c]).plugins, [a, b, c]);
});

test('supports injecting additional processors at runtime', t => {
    let plugin1 = postcss.plugin('one', () => {
        return css => {
            css.walkDecls(decl => {
                decl.value = 'world';
            });
        };
    });
    let plugin2 = postcss.plugin('two', () => {
        return (css, result) => {
            result.processor.use(plugin1());
        };
    });

    return postcss([ plugin2 ]).process('a{hello: bob}').then(result => {
        t.deepEqual(result.css, 'a{hello: world}');
    });
});

test('creates plugin', t => {
    let plugin = postcss.plugin('test', filter => {
        return function (css) {
            css.walkDecls(filter || 'two', i => i.remove() );
        };
    });

    let func1 = postcss(plugin).plugins[0];
    t.deepEqual(func1.postcssPlugin, 'test');
    t.regex(func1.postcssVersion, /\d+.\d+.\d+/);

    let func2 = postcss(plugin()).plugins[0];
    t.deepEqual(func2.postcssPlugin, func1.postcssPlugin);
    t.deepEqual(func2.postcssVersion, func1.postcssVersion);

    let result1 = postcss(plugin('one')).process('a{ one: 1; two: 2 }');
    t.deepEqual(result1.css, 'a{ two: 2 }');

    let result2 = postcss(plugin).process('a{ one: 1; two: 2 }');
    t.deepEqual(result2.css, 'a{ one: 1 }');
});

test('does not call plugin constructor', t => {
    let calls = 0;
    let plugin = postcss.plugin('test', () => {
        calls += 1;
        return function () { };
    });
    t.is(calls, 0);

    postcss(plugin).process('a{}');
    t.is(calls, 1);

    postcss(plugin()).process('a{}');
    t.is(calls, 2);
});

test('creates a shortcut to process css', t => {
    let plugin = postcss.plugin('test', (str = 'bar') => {
        return function (css) {
            css.walkDecls(i => {
                i.value = str;
            });
        };
    });

    let result1 = plugin.process('a{value:foo}');
    t.deepEqual(result1.css, 'a{value:bar}');

    let result2 = plugin.process('a{value:foo}', 'baz');
    t.deepEqual(result2.css, 'a{value:baz}');

    plugin.process('a{value:foo}').then( result => {
        t.deepEqual(result.css, 'a{value:bar}');
    });
});

test('contains parser', t => {
    t.deepEqual(postcss.parse('').type, 'root');
});

test('contains stringifier', t => {
    t.deepEqual(typeof postcss.stringify, 'function');
});

test('allows to build own CSS', t => {
    let root    = postcss.root({ raws: { after: '\n' } });
    let comment = postcss.comment({ text: 'Example' });
    let media   = postcss.atRule({ name: 'media', params: 'screen' });
    let rule    = postcss.rule({ selector: 'a' });
    let decl    = postcss.decl({ prop: 'color', value: 'black' });

    root.append(comment);
    rule.append(decl);
    media.append(rule);
    root.append(media);

    t.deepEqual(root.toString(), '/* Example */\n' +
                                 '@media screen {\n' +
                                 '    a {\n' +
                                 '        color: black\n' +
                                 '    }\n' +
                                 '}\n');
});

test('contains vendor module', t => {
    t.deepEqual(postcss.vendor.prefix('-moz-tab'), '-moz-');
});

test('contains list module', t => {
    t.deepEqual(postcss.list.space('a b'), ['a', 'b']);
});
