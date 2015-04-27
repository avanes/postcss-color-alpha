var color = require("color");
var messageHelpers = require("postcss-message-helpers");
var list = require('postcss').list;

var HEX_A_RE    = /#([0-9a-f]{3}|[0-9a-f]{6})(\.\d+)\b/i;
var BW_RE       = /(black|white)\((0?\.?\d+)?\)/i;
var BW_RE_2     = /^(black|white)\((0?\.?\d+)?\)/i;
var BRACKETS_RE = /\((..*)\)/;

module.exports = function () {
    return function (css) {
        // Transform CSS AST here
        css.eachDecl(function transformDecl(decl) {
            if ( !decl.value || !( decl.value.match(HEX_A_RE) || decl.value.match(BW_RE) ) ) {
                return;
            }

            decl.value = messageHelpers.try(function () {
                return transformBlackWhiteAlpha(decl.value, decl.source);
            }, decl.source);

            decl.value = messageHelpers.try(function () {
                return transformHexAlpha(decl.value, decl.source);
            }, decl.source);
        });
    };
};

module.exports.postcss = function (css) {
    return module.exports()(css);
};


var transformHexAlpha = function(string) {
    var convertedParts = [];
    var parts = list.space(string);

    for (var i = 0; i < parts.length; i++) {
        var part = parts[i];

        var matches = HEX_A_RE.exec(part);
        if ( !matches ) {
            convertedParts.push(part);
            continue;
        }

        var rgbHex = matches[1];
        var alpha  = matches[2];

        convertedParts.push(part.replace(HEX_A_RE, hexAlphaToRgba(rgbHex, alpha)));
    }

    if ( convertedParts.length === 0) return string;
    return convertedParts.join(' ').trim();
};

var transformBlackWhiteAlpha = function(string) {
    var convertedParts = [];
    var parts = list.space(string);

    for (var i = 0; i < parts.length; i++) {
        var rgbHex;
        var alpha;
        var part = parts[i];
        var matches = BW_RE_2.exec(part);

        if ( !matches ) {
            convertedParts.push(checkInnerBrackets(part));
            continue;
        }

        part = checkInnerBrackets(part);
        alpha  = matches[2];
        if ( typeof alpha === 'undefined' )
            alpha = '.0';
        if ( alpha.indexOf('.') === -1 && alpha !== '1')
            alpha = '.' + alpha;
        if ( alpha === '1' )
            alpha = '';
        if ( alpha[0] === '0' )
            alpha = alpha.substr(1);
        if ( matches[1] === "black" )
            rgbHex = "000";
        else if ( matches[1] === "white" )
            rgbHex = "FFF";

        convertedParts.push('#' + rgbHex + alpha);
    }

    if ( convertedParts.length === 0) return string;
    return convertedParts.join(' ').trim();
};

function checkInnerBrackets(string) {
    var convertedParts = [];
    var matches = BRACKETS_RE.exec(string);
    if ( !matches )
        return string;
    var parts = list.comma(matches[1]);
    for (var i = 0; i < parts.length; i++) {
        var part = parts[i];
        convertedParts.push(transformHexAlpha(transformBlackWhiteAlpha(part)));
    }
    return string.substr(0, matches.index) + '(' + convertedParts.join(', ') + ')';
}

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
