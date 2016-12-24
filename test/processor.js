import LazyResult from '../lib/lazy-result';
import Processor  from '../lib/processor';
import postcss    from '../lib/postcss';
import Result     from '../lib/result';
import parse      from '../lib/parse';
import Root       from '../lib/root';

import sinon from 'sinon';
import path  from 'path';
import test  from 'ava';

function prs() {
    return new Root({ raws: { after: 'ok' } });
}

function str(node, builder) {
    builder(node.raws.after + '!');
}

let beforeFix = new Processor([ css => {
    css.walkRules( rule => {
        if ( !rule.selector.match(/::(before|after)/) ) return;
        if ( !rule.some( i => i.prop === 'content' ) ) {
            rule.prepend({ prop: 'content', value: '""' });
        }
    });
}]);

test.before( () => {
    sinon.stub(console, 'warn');
});

test.after( () => {
    console.warn.restore();
});

test('adds new plugins', t => {
    let a = () => 1;
    let processor = new Processor();
    processor.use(a);
    t.deepEqual(processor.plugins, [a]);
});

test('adds new plugin by object', t => {
    let a = () => 1;
    let processor = new Processor();
    processor.use({ postcss: a });
    t.deepEqual(processor.plugins, [a]);
});

test('adds new plugin by object-function', t => {
    let a   = () => 1;
    let obj = () => 2;
    obj.postcss = a;
    let processor = new Processor();
    processor.use(obj);
    t.deepEqual(processor.plugins, [a]);
});

test('adds new processors of another postcss instance', t => {
    let a = () => 1;
    let processor = new Processor();
    let other     = new Processor([a]);
    processor.use(other);
    t.deepEqual(processor.plugins, [a]);
});

test('adds new processors from object', t => {
    let a = () => 1;
    let processor = new Processor();
    let other     = new Processor([a]);
    processor.use({ postcss: other });
    t.deepEqual(processor.plugins, [a]);
});

test('returns itself', t => {
    let a = () => 1;
    let b = () => 2;
    let processor = new Processor();
    t.deepEqual(processor.use(a).use(b).plugins, [a, b]);
});

test('throws on wrong format', t => {
    let pr = new Processor();
    t.throws( () => {
        pr.use(1);
    }, /1 is not a PostCSS plugin/);
});

test('processes CSS', t => {
    let result = beforeFix.process('a::before{top:0}');
    t.deepEqual(result.css, 'a::before{content:"";top:0}');
});

test('processes parsed AST', t => {
    let root   = parse('a::before{top:0}');
    let result = beforeFix.process(root);
    t.deepEqual(result.css, 'a::before{content:"";top:0}');
});

test('processes previous result', t => {
    let result = (new Processor()).process('a::before{top:0}');
    result = beforeFix.process(result);
    t.deepEqual(result.css, 'a::before{content:"";top:0}');
});

test('takes maps from previous result', t => {
    let one = (new Processor()).process('a{}', {
        from: 'a.css',
        to:   'b.css',
        map:  { inline: false }
    });
    let two = (new Processor()).process(one, { to: 'c.css' });
    t.deepEqual(two.map.toJSON().sources, ['a.css']);
});

test('inlines maps from previous result', t => {
    let one = (new Processor()).process('a{}', {
        from: 'a.css',
        to:   'b.css',
        map:  { inline: false }
    });
    let two = (new Processor()).process(one, {
        to:  'c.css',
        map: { inline: true }
    });
    t.deepEqual(typeof two.map, 'undefined');
});

test('throws with file name', t => {
    let error;
    try {
        (new Processor()).process('a {', { from: 'a.css' }).css;
    } catch (e) {
        if ( e.name === 'CssSyntaxError' ) {
            error = e;
        } else {
            throw e;
        }
    }

    t.deepEqual(error.file, path.resolve('a.css'));
    t.regex(error.message, /a.css:1:1: Unclosed block$/);
});

test('allows to replace Root', t => {
    let plugin = (css, result) => {
        result.root = new Root();
    };
    let processor = new Processor([plugin]);
    t.deepEqual(processor.process('a {}').css, '');
});

test('returns LazyResult object', t => {
    let result = (new Processor()).process('a{}');
    t.truthy(result instanceof LazyResult);
    t.deepEqual(result.css,        'a{}');
    t.deepEqual(result.toString(), 'a{}');
});

test('calls all plugins once', t => {
    t.plan(1);

    let calls = '';
    let a = () => {
        calls += 'a';
    };
    let b = () => {
        calls += 'b';
    };

    let result = new Processor([a, b]).process('');
    result.css;
    result.map;
    result.root;
    return result.then( () => {
        t.deepEqual(calls, 'ab');
    });
});

test('parses, converts and stringifies CSS', t => {
    let a = css => t.truthy(css instanceof Root);
    t.deepEqual(typeof (new Processor([a])).process('a {}').css, 'string');
});

test('send result to plugins', t => {
    let processor = new Processor();
    let a = (css, result) => {
        t.truthy(result instanceof Result);
        t.deepEqual(result.processor, processor);
        t.deepEqual(result.opts, { map: true });
        t.deepEqual(result.root, css);
    };
    processor.use(a).process('a {}', { map: true });
});

test('accepts source map from PostCSS', t => {
    let one = (new Processor()).process('a{}', {
        from: 'a.css',
        to:   'b.css',
        map:  { inline: false }
    });
    let two = (new Processor()).process(one.css, {
        from: 'b.css',
        to:   'c.css',
        map:  { prev: one.map, inline: false }
    });
    t.deepEqual(two.map.toJSON().sources, ['a.css']);
});

test('supports async plugins', t => {
    let starts = 0;
    let finish = 0;
    let async1 = css => {
        return new Promise(resolve => {
            starts += 1;
            setTimeout(() => {
                t.deepEqual(starts, 1);

                css.append('a {}');
                finish += 1;
                resolve();
            }, 1);
        });
    };
    let async2 = css => {
        return new Promise(resolve => {
            t.deepEqual(starts, 1);
            t.deepEqual(finish, 1);

            starts += 1;
            setTimeout(() => {
                css.append('b {}');
                finish += 1;
                resolve();
            }, 1);
        });
    };
    return (new Processor([async1, async2])).process('').then( result => {
        t.deepEqual(starts, 2);
        t.deepEqual(finish, 2);
        t.deepEqual(result.css, 'a {}\nb {}');
    });
});

test('works async without plugins', t => {
    return (new Processor()).process('a {}').then( result => {
        t.deepEqual(result.css, 'a {}');
    });
});

test('runs async plugin only once', t => {
    t.plan(1);

    let calls = 0;
    let async = () => {
        return new Promise( resolve => {
            setTimeout(() => {
                calls += 1;
                resolve();
            }, 1);
        });
    };

    let result = (new Processor([async])).process('a {}');
    result.then( () => { });
    return result.then( () => {
        return result.then( () => {
            t.deepEqual(calls, 1);
        });
    });
});

test('supports async errors', t => {
    let error = new Error('Async');
    let async = () => {
        return new Promise( (resolve, reject) => {
            reject(error);
        });
    };
    let result = (new Processor([async])).process('');
    return result.then( () => {
        t.fail();
    }).catch( err => {
        t.deepEqual(err, error);
        return result.catch( err2 => {
            t.deepEqual(err2, error);
        });
    });
});

test('supports sync errors in async mode', t => {
    let error = new Error('Async');
    let async = () => {
        throw error;
    };
    return (new Processor([async])).process('').then( () => {
        t.fail();
    }).catch( err => {
        t.deepEqual(err, error);
    });
});

test('throws parse error in async', t => {
    return (new Processor()).process('a{').catch( err => {
        t.deepEqual(err.message, '<css input>:1:1: Unclosed block');
    });
});

test('throws error on sync method to async plugin', t => {
    let async = () => {
        return new Promise( resolve => resolve() );
    };
    t.throws( () => {
        (new Processor([async])).process('a{}').css;
    }, /async/);
});

test('throws a sync call in async running', t => {
    let async = () => new Promise( done => setTimeout(done, 1) );

    let processor = (new Processor([async])).process('a{}');
    processor.async();

    t.throws( () => {
        processor.sync();
    }, /then/);
});

test('checks plugin compatibility', t => {
    let plugin = postcss.plugin('test', () => {
        return () => {
            throw new Error('Er');
        };
    });
    let func = plugin();
    func.postcssVersion = '2.1.5';

    let processBy = version => {
        let processor = new Processor([func]);
        processor.version = version;
        processor.process('a{}').css;
    };

    t.throws( () => {
        processBy('1.0.0');
    }, 'Er');
    t.deepEqual(console.warn.callCount, 1);
    t.deepEqual(console.warn.args[0][0],
        'Your current PostCSS version is 1.0.0, but test uses 2.1.5. ' +
        'Perhaps this is the source of the error below.');

    t.throws( () => {
        processBy('3.0.0');
    }, 'Er');
    t.deepEqual(console.warn.callCount, 2);

    t.throws( () => {
        processBy('2.0.0');
    }, 'Er');
    t.deepEqual(console.warn.callCount, 3);

    t.throws( () => {
        processBy('2.1.0');
    }, 'Er');
    t.deepEqual(console.warn.callCount, 3);
});

test('sets last plugin to result', t => {
    let plugin1 = function (css, result) {
        t.is(result.lastPlugin, plugin1);
    };
    let plugin2 = function (css, result) {
        t.is(result.lastPlugin, plugin2);
    };

    let processor = new Processor([plugin1, plugin2]);
    return processor.process('a{}').then( result => {
        t.is(result.lastPlugin, plugin2);
    });
});

test('uses custom parsers', t => {
    let processor = new Processor([]);
    return processor.process('a{}', { parser: prs }).then( result => {
        t.deepEqual(result.css, 'ok');
    });
});

test('uses custom parsers from object', t => {
    let processor = new Processor([]);
    let syntax    = { parse: prs, stringify: str };
    return processor.process('a{}', { parser: syntax }).then( result => {
        t.deepEqual(result.css, 'ok');
    });
});

test('uses custom stringifier', t => {
    let processor = new Processor([]);
    return processor.process('a{}', { stringifier: str }).then( result => {
        t.deepEqual(result.css, '!');
    });
});

test('uses custom stringifier from object', t => {
    let processor = new Processor([]);
    let syntax    = { parse: prs, stringify: str };
    return processor.process('', { stringifier: syntax }).then( result => {
        t.deepEqual(result.css, '!');
    });
});

test('uses custom stringifier with source maps', t => {
    let processor = new Processor([]);
    return processor.process('a{}', { map: true, stringifier: str })
        .then( result => {
            t.regex(result.css, /!\n\/\*# sourceMap/);
        });
});

test('uses custom syntax', t => {
    let processor = new Processor([]);
    let syntax    = { parse: prs, stringify: str };
    return processor.process('a{}', { syntax }).then( result => {
        t.deepEqual(result.css, 'ok!');
    });
});

test('contains PostCSS version', t => {
    t.regex((new Processor()).version, /\d+.\d+.\d+/);
});

test('throws on syntax as plugin', t => {
    let processor = new Processor();
    t.throws( () => {
        processor.use({
            parse() { }
        });
    }, /syntax/);
});
