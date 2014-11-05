var Root   = require('../lib/root');
var Rule   = require('../lib/rule');
var parse  = require('../lib/parse');
var Result = require('../lib/result');

var fs = require('fs');

describe('Root', () => {

    describe('toString()', () => {

        fs.readdirSync(__dirname + '/cases/parse/').forEach( file => {
            if ( !file.match(/\.css$/) ) return;

            it('stringify ' + file, () => {
                var path = __dirname + '/cases/parse/' + file;
                var css  = fs.readFileSync(path).toString();
                parse(css).toString().should.eql(css);
            });
        });

        it('saves one line on insert', () => {
            var css = parse("a {}");
            css.prepend( new Rule({ selector: 'em' }) );

            css.toString().should.eql("em {}a {}");
        });

        it('fixes spaces on insert before first', () => {
            var css = parse("a {}\nb {}");
            css.prepend( new Rule({ selector: 'em' }) );

            css.toString().should.eql("em {}\na {}\nb {}");
        });

        it('fixes spaces on insert before only one fule', () => {
            var css = parse("a {}\n");
            css.insertBefore(css.childs[0], new Rule({ selector: 'em' }) );

            css.toString().should.eql("em {}\na {}\n");
        });

    });

    describe('append()', () => {

        it('sets new line between rules in multiline files', () => {
            var a = parse('a {}\n\na {}\n');
            var b = parse('b {}\n');

            a.append(b).toString().should.eql('a {}\n\na {}\n\nb {}\n');
        });

        it('sets new line between rules on last newline', () => {
            var a = parse('a {}\n');
            var b = parse('b {}\n');

            a.append(b).toString().should.eql('a {}\nb {}\n');
        });

        it('saves compressed style', () => {
            var a1 = parse('a{}');
            var a2 = parse('a{}a{}');
            var b  = parse('b{}\n');

            a1.append(b).toString().should.eql('a{}b{}');
            a2.append(b).toString().should.eql('a{}a{}b{}');
        });

    });

    describe('remove()', () => {

        it('fixes spaces on removing first rule', () => {
            var css = parse('a{}\nb{}\n');
            css.first.removeSelf();
            css.toString().should.eql('b{}\n');
        });

    });

    describe('toResult()', () => {

        it('generates result with map', () => {
            var root   = parse('a {}');
            var result = root.toResult({ map: true });

            result.should.be.a.instanceOf(Result);
            result.css.should.startWith('a {}\n/*# sourceMappingURL=');
        });

    });

});
