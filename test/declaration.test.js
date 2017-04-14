import Declaration from '../lib/declaration';
import parse       from '../lib/parse';
import Rule        from '../lib/rule';

it('initializes with properties', () => {
    let decl = new Declaration({ prop: 'color', value: 'black' });
    expect(decl.prop).toEqual('color');
    expect(decl.value).toEqual('black');
});

it('returns boolean important', () => {
    let decl = new Declaration({ prop: 'color', value: 'black' });
    decl.important = true;
    expect(decl.toString()).toEqual('color: black !important');
});

it('inserts default spaces', () => {
    let decl = new Declaration({ prop: 'color', value: 'black' });
    let rule = new Rule({ selector: 'a' });
    rule.append(decl);
    expect(rule.toString()).toEqual('a {\n    color: black\n}');
});

it('clones spaces from another declaration', () => {
    let root = parse('a{color:black}');
    let decl = new Declaration({ prop: 'margin', value: '0' });
    root.first.append(decl);
    expect(root.toString()).toEqual('a{color:black;margin:0}');
});
