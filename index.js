var color = require("color");
var messageHelpers = require("postcss-message-helpers");

var HEX_A_RE = /#(([0-9a-f]{3}|[0-9a-f]{6})(\.\d+))\b/i;
var BW_RE    = /\b(black|white)\((0?\.\d+)\)/i;

module.exports = function () {
    return function (css) {
        // Transform CSS AST here
        css.eachDecl(function transformDecl(decl) {
            if ( !decl.value || !( decl.value.match(HEX_A_RE) || decl.value.match(BW_RE) ) ) {
                return;
            }

            decl.value = messageHelpers.try(function () {
                return transformHexAlpha(decl.value, decl.source);
            }, decl.source);

            decl.value = messageHelpers.try(function () {
                return transformBlackWhiteAlpha(decl.value, decl.source);
            }, decl.source);
        });
    };
};

module.exports.postcss = function (css) {
    return module.exports()(css);
};


var transformHexAlpha = function(string) {
    var matches;
    var rgbHex;
    var alpha;

    matches = HEX_A_RE.exec(string);
    if ( !matches )
        return string;

    rgbHex = matches[2];
    alpha  = matches[3];

    return string.slice(0, matches.index) + hexAlphaToRgba(rgbHex, alpha);
};

var transformBlackWhiteAlpha = function(string) {
    var rgbHex;
    var matches;
    var alpha;

    matches = BW_RE.exec(string);
    if ( !matches )
        return string;
    if ( matches[1] === "black" )
        rgbHex = "000";
    else if ( matches[1] === "white" )
        rgbHex = "FFF";
    else
        return string;

    alpha  = matches[2];

    return string.slice(0, matches.index) + hexAlphaToRgba(rgbHex, alpha);
};

function hexAlphaToRgba(hex, alpha) {
    var hexNormalized;
    var rgb = [];

    if ( hex.length === 3 )
        hexNormalized = hex.charAt(0) + hex.charAt(0) + hex.charAt(1) + hex.charAt(1) + hex.charAt(2) + hex.charAt(2);
    if ( hex.length === 6 )
        hexNormalized = hex;

    for (var i = 0; i < hexNormalized.length; i += 2) {
        rgb.push(Math.round(parseInt(hexNormalized.substr(i, 2), 16)));
    }

    return color({
        r: rgb[0],
        g: rgb[1],
        b: rgb[2],
        a: alpha
    }).rgbaString();
}
