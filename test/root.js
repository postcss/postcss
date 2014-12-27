var Root   = require('../lib/root');
var Rule   = require('../lib/rule');
var parse  = require('../lib/parse');
var Result = require('../lib/result');

var expect = require('chai').expect;
var fs     = require('fs');

describe('Root', () => {

    describe('toString()', () => {

        fs.readdirSync(__dirname + '/cases/').forEach( file => {
            if ( !file.match(/\.css$/) ) return;

            it('stringify ' + file, () => {
                var path = __dirname + '/cases/' + file;
                var css  = fs.readFileSync(path).toString();
                expect(parse(css).toString()).to.eql(css);
            });
        });

    });

    describe('prepend()', () => {

        it('fixes spaces on insert before first', () => {
            var css = parse("a {} b {}");
            css.prepend({ selector: 'em' });
            expect(css.toString()).to.eql("em {} a {} b {}");
        });

        it('uses default spaces on only first', () => {
            var css = parse("a {}");
            css.prepend({ selector: 'em' });
            expect(css.toString()).to.eql("em {}\na {}");
        });

    });

    describe('append()', () => {

        it('sets new line between rules in multiline files', () => {
            var a = parse('a {}\n\na {}\n');
            var b = parse('b {}\n');

            expect(a.append(b).toString()).to.eql('a {}\n\na {}\n\nb {}\n');
        });

        it('sets new line between rules on last newline', () => {
            var a = parse('a {}\n');
            var b = parse('b {}\n');

            expect(a.append(b).toString()).to.eql('a {}\nb {}\n');
        });

        it('saves compressed style', () => {
            var a = parse('a{}a{}');
            var b = parse('b {\n}\n');
            expect(a.append(b).toString()).to.eql('a{}a{}b{}');
        });

    });

    describe('insertAfter()', () => {

        it('does not use before of first rule', () => {
            var css = parse('a{} b{}');
            css.insertAfter(0, { selector: '.a' });
            css.insertAfter(2, { selector: '.b' });

            expect(css.nodes[1].before).to.not.exist();
            expect(css.nodes[3].before).to.eql(' ');
            expect(css.toString()).to.eql('a{} .a{} b{} .b{}');
        });

    });

    describe('remove()', () => {

        it('fixes spaces on removing first rule', () => {
            var css = parse('a{}\nb{}\n');
            css.first.removeSelf();
            expect(css.toString()).to.eql('b{}\n');
        });

    });

    describe('toResult()', () => {

        it('generates result with map', () => {
            var root   = parse('a {}');
            var result = root.toResult({ map: true });

            expect(result).to.be.a.instanceOf(Result);
            expect(result.css).to.match(/a \{\}\n\/\*# sourceMappingURL=/);
        });

    });

});
