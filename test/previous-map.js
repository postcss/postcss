import parse from '../lib/parse';

import mozilla from 'source-map';
import { expect } from 'chai';
import fs from 'fs-extra';

var dir = __dirname + '/fixtures';
var map = JSON.stringify({
    version:  3,
    file:     null,
    sources:  [],
    names:    [],
    mappings: []
});

describe('PreviousMap', () => {
    afterEach( () => {
        if ( fs.existsSync(dir) ) fs.removeSync(dir);
    });

    it('misses property if no map', () => {
        expect(parse('a{}')).to.not.have.property('prevMap');
    });

    it('creates property if map present', () => {
        expect(parse('a{}', { map: { prev: map } }).prevMap.text).to.eql(map);
    });

    it('returns consumer', () => {
        expect(parse('a{}', { map: { prev: map } }).prevMap.consumer())
            .to.be.a.instanceOf(mozilla.SourceMapConsumer);
    });

    it('sets annotation property', () => {
        var map2 = { map: { prev: map } };
        expect(parse('a{}', map2).prevMap).to.not.have.property('annotation');
        var root = parse('a{}/*# sourceMappingURL=a.css.map */', map2);
        expect(root.prevMap.annotation).to.eql('a.css.map');
    });

    it('checks previous sources content', () => {
        var map2 = {
            version:  3,
            file:     'b',
            sources:  ['a'],
            names:    [],
            mappings: []
        };

        var opts = { map: { prev: map2 } };
        expect(parse('a{}', opts).prevMap.withContent()).to.be.false;

        map2.sourcesContent = ['a{}'];
        expect(parse('a{}', opts).prevMap.withContent()).to.be.true;
    });

    it('decodes base64 maps', () => {
        var b64 = new Buffer(map).toString('base64');
        var css = "a{}\n" +
                  `/*# sourceMappingURL=data:application/json;base64,${b64} */`;

        expect(parse(css).prevMap.text).to.eql(map);
    });

    it('decodes URI maps', () => {
        var uri = 'data:application/json,' + decodeURI(map);
        var css = "a{}\n/*# sourceMappingURL=" + uri + " */";

        expect(parse(css).prevMap.text).to.eql(map);
    });

    it('removes map on request', () => {
        var uri = 'data:application/json,' + decodeURI(map);
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
        fs.outputFileSync(dir + '/a.map', map);
        root = parse("a{}\n/*# sourceMappingURL=a.map */", {
            from: dir + '/a.css'
        });

        expect(root.prevMap.text).to.eql(map);
        expect(root.prevMap.root).to.eql(dir);
    });

    it('sets uniq name for inline map', () => {
        var map2 = {
            version:  3,
            sources:  ['a'],
            names:    [],
            mappings: []
        };

        var opts = { map: { prev: map2 } };
        var prev = parse('a{}', opts).prevMap;

        expect(prev.file).to.match(/^<input css \d+>$/);
        expect(prev.file).to.not.eql( parse('a{}', opts).prevMap.file );
    });

});
