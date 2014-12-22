var parse = require('../lib/parse');

var mozilla = require('source-map');
var expect  = require('chai').expect;
var fs      = require('fs-extra');

describe('PreviousMap', () => {
    before( () => {
        this.map = JSON.stringify({
            version:  3,
            file:     null,
            sources:  [],
            names:    [],
            mappings: []
        });
        this.dir = __dirname + '/fixtures';
    });

    afterEach( () => {
        if ( fs.existsSync(this.dir) ) fs.removeSync(this.dir);
    });

    it('misses property if no map', () => {
        expect(parse('a{}')).to.not.have.property('prevMap');
    });

    it('creates property if map present', () => {
        expect(parse('a{}', { map: { prev: this.map } }).prevMap.text)
            .to.eql(this.map);
    });

    it('returns consumer', () => {
        expect(parse('a{}', { map: { prev: this.map } }).prevMap.consumer())
            .to.be.a.instanceOf(mozilla.SourceMapConsumer);
    });

    it('sets annotation property', () => {
        var map = { map: { prev: this.map } };
        expect(parse('a{}', map).prevMap).to.not.have.property('annotation');
        var root = parse('a{}/*# sourceMappingURL=a.css.map */', map);
        expect(root.prevMap.annotation).to.eql('a.css.map');
    });

    it('checks previous sources content', () => {
        var map  = {
            version:  3,
            file:     'b',
            sources:  ['a'],
            names:    [],
            mappings: []
        };

        var opts = { map: { prev: map } };
        expect(parse('a{}', opts).prevMap.withContent()).to.be.false;

        map.sourcesContent = ['a{}'];
        expect(parse('a{}', opts).prevMap.withContent()).to.be.true;
    });

    it('decode base64 maps', () => {
        var b64 = new Buffer(this.map).toString('base64');
        var css = "a{}\n" +
                  `/*# sourceMappingURL=data:application/json;base64,${b64} */`;

        expect(parse(css).prevMap.text).to.eql(this.map);
    });

    it('decode URI maps', () => {
        var uri = 'data:application/json,' + decodeURI(this.map);
        var css = "a{}\n/*# sourceMappingURL=" + uri + " */";

        expect(parse(css).prevMap.text).to.eql(this.map);
    });

    it('remove map on request', () => {
        var uri = 'data:application/json,' + decodeURI(this.map);
        var css = "a{}\n/*# sourceMappingURL=" + uri + " */";

        expect(parse(css, { map: { prev: false } }))
            .to.not.have.property('prevMap');
    });

    it('raises on unknown inline encoding', () => {
        var css = "a { }\n" +
                  "/*# sourceMappingURL=data:application/json;" +
                  "md5,68b329da9893e34099c7d8ad5cb9c940*/";

        expect( () => parse(css) )
            .to.throw('Unsupported source map encoding md5');
    });

    it('raises on unknown map format', () => {
        expect( () => parse('a{}', { map: { prev: 1 } }) )
            .to.throw('Unsupported previous source map format: 1');
    });

    it('reads map from annotation', () => {
        fs.outputFileSync(this.dir + '/a.map', this.map);
        root = parse("a{}\n/*# sourceMappingURL=a.map */", {
            from: this.dir + '/a.css'
        });

        expect(root.prevMap.text).to.eql(this.map);
        expect(root.prevMap.root).to.eql(this.dir);
    });

    it('sets uniq name for inline map', () => {
        var map  = {
            version:  3,
            sources:  ['a'],
            names:    [],
            mappings: []
        };

        var opts = { map: { prev: map } };
        var prev = parse('a{}', opts).prevMap;

        expect(prev.file).to.match(/^<input css \d+>$/);
        expect(prev.file).to.not.eql( parse('a{}', opts).prevMap.file );
    });

});
