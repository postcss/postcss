var parse = require('../lib/parse');

var mozilla = require('source-map');
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

    it('miss property if no map', () => {
        parse('a{}').should.not.have.property('prevMap');
    });

    it('creates property if map present', () => {
        parse('a{}', { map: { prev: this.map } }).prevMap
            .text.should.eql(this.map);
    });

    it('returns consumer', () => {
        parse('a{}', { map: { prev: this.map } }).prevMap
            .consumer().should.be.a.instanceOf(mozilla.SourceMapConsumer);
    });

    it('sets annotation property', () => {
        var map = { map: { prev: this.map } };
        parse('a{}', map)
            .prevMap.should.not.have.property('annotation');
        parse('a{}/*# sourceMappingURL=a.css.map */', map)
            .prevMap.annotation.should.eql('# sourceMappingURL=a.css.map');
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
        parse('a{}', opts).prevMap.withContent().should.be.false;

        map.sourcesContent = ['a{}'];
        parse('a{}', opts).prevMap.withContent().should.be.true;
    });

    it('decode base64 maps', () => {
        var b64 = new Buffer(this.map).toString('base64');
        var css = "a{}\n" +
                  `/*# sourceMappingURL=data:application/json;base64,${b64} */`;

        parse(css).prevMap.text.should.eql(this.map);
    });

    it('decode URI maps', () => {
        var uri = decodeURI(this.map);
        var css = `a{}\n/*# sourceMappingURL=data:application/json,${uri} */`;

        parse(css).prevMap.text.should.eql(this.map);
    });

    it('remove map on request', () => {
        var uri = decodeURI(this.map);
        var css = `a{}\n/*# sourceMappingURL=data:application/json,${uri} */`;

        parse(css, { map: { prev: false } })
            .should.not.have.property('prevMap');
    });

    it('raises on unknown inline encoding', () => {
        var css = "a { }\n" +
                  "/*# sourceMappingURL=data:application/json;" +
                  "md5,68b329da9893e34099c7d8ad5cb9c940*/";

        ( () => parse(css) ).should.throw(
            'Unsupported source map encoding md5');
    });

    it('raises on unknown map format', () => {
        ( () => parse('a{}', { map: { prev: 1 } }) ).should.throw(
            'Unsupported previous source map format: 1');
    });

    it('reads map from annotation', () => {
        fs.outputFileSync(this.dir + '/a.map', this.map);
        root = parse("a{}\n/*# sourceMappingURL=a.map */", {
            from: this.dir + '/a.css'
        });

        root.prevMap.text.should.eql(this.map);
        root.prevMap.root.should.eql(this.dir);
    });

});
