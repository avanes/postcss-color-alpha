var postcss = require('postcss');
var expect  = require('chai').expect;

var plugin = require('../');

var test = function (input, output, opts) {
    expect(postcss([plugin(opts)]).process(input).css).to.eql(output);
};

describe('postcss-color-alpha', function () {

    it('converts black() to rgba', function () {
        test('a{ color: black(.1) }', 'a{ color: rgba(0, 0, 0, 0.1) }');
    });

    it('converts white() to rgba', function () {
        test('a{ color: white(.2) }', 'a{ color: rgba(255, 255, 255, 0.2) }');
    });

    it('converts `#rgb a` to rgba', function () {
        test('a{ color: #0fc.3 }', 'a{ color: rgba(0, 255, 204, 0.3) }');
    });

    it('converts `#rrggbb a` to rgba', function () {
        test('a{ color: #00ffcc.45 }', 'a{ color: rgba(0, 255, 204, 0.45) }');
    });

});
