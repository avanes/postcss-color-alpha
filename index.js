var postcss = require('postcss');
var color = require("color");
var messageHelpers = require("postcss-message-helpers");
var list = postcss.list;

var HEX_A_RE    = /#([0-9a-f]{3}|[0-9a-f]{6})(\.\d+)\b/i;
var BW_RE       = /(black|white)\((0?\.?\d+)?\)/i;
var BW_RE_2     = /^(black|white)\((0?\.?\d+)?\)/i;
var BRACKETS_RE = /\((..*)\)/;
var RGBA_RE     = /rgba\(#([0-9a-f]{3}|[0-9a-f]{6}),\ ?(0?\.?\d+)\)/i;
var RGBA_RE_2   = /^rgba\(#([0-9a-f]{3}|[0-9a-f]{6}),\ ?(0?\.?\d+)\)/i;

module.exports = postcss.plugin('postcss-color-alpha', function (opts) {
    return function (css, result) {
        // Transform CSS AST here
        css.walkDecls(function transformDecl(decl) {
            if ( !decl.value || !(
                    decl.value.match(HEX_A_RE) ||
                    decl.value.match(BW_RE) ||
                    decl.value.match(RGBA_RE)
                )
            ) {
                return;
            }

            decl.value = messageHelpers.try(function () {
                return transformBlackWhiteAlpha(decl.value, decl.source);
            }, decl.source);

            decl.value = messageHelpers.try(function () {
                return transformHexAlpha(decl.value, decl.source);
            }, decl.source);

            decl.value = messageHelpers.try(function () {
                return transformRgbAlpha(decl.value, decl.source);
            }, decl.source);
        });
    };
});

var transformRgbAlpha = function(string) {
    if (!RGBA_RE.test(string))
        return string;

    var convertedCommaParts = [];
    var commaParts = list.comma(string);

    for (var i = 0; i < commaParts.length; i++) {
        var convertedParts = [];
        var parts = list.space(commaParts[i]);
        for (var j = 0; j < parts.length; j++) {
            var part = parts[j];

            var matches = RGBA_RE_2.exec(part);
            if ( !matches ) {
                convertedParts.push(checkInnerBrackets(part));
                continue;
            }

            var rgbHex = matches[1];
            var alpha  = matches[2];
            alpha = parseAlpha(alpha);


            convertedParts.push(part.replace(RGBA_RE, hexAlphaToRgba(rgbHex, alpha)));

        }
        convertedCommaParts.push(convertedParts.join(' ').trim());
    }
    return convertedCommaParts.join(', ');
};

var transformHexAlpha = function(string) {
    var convertedCommaParts = [];
    var commaParts = list.comma(string);

    for (var i = 0; i < commaParts.length; i++) {
        var convertedParts = [];
        var parts = list.space(commaParts[i]);
        for (var j = 0; j < parts.length; j++) {
            var part = parts[j];

            var matches = HEX_A_RE.exec(part);
            if ( !matches ) {
                convertedParts.push(checkInnerBrackets(part));
                continue;
            }

            var rgbHex = matches[1];
            var alpha  = matches[2];
            if ( typeof alpha === 'undefined' )
                alpha = '.0';
            alpha = parseAlpha(alpha);

            if ( matches[1] === "black" )
                rgbHex = "000";
            else if ( matches[1] === "white" )
                rgbHex = "FFF";

            convertedParts.push(part.replace(HEX_A_RE, hexAlphaToRgba(rgbHex, alpha)));
        }
        convertedCommaParts.push(convertedParts.join(' ').trim());
    }
    return convertedCommaParts.join(', ');
};

var transformBlackWhiteAlpha = function(string) {
    var convertedCommaParts = [];
    var commaParts = list.comma(string);

    for (var i = 0; i < commaParts.length; i++) {
        var convertedParts = [];
        var parts = list.space(commaParts[i]);
        for (var j = 0; j < parts.length; j++) {
            var part = parts[j];
            var rgbHex;
            var alpha;
            var matches = BW_RE_2.exec(part);

            if ( !matches ) {
                convertedParts.push(checkInnerBrackets(part));
                continue;
            }

            part = checkInnerBrackets(part);
            alpha  = matches[2];
            if ( typeof alpha === 'undefined' )
                alpha = '.0';
            alpha = parseAlpha(alpha);

            if ( matches[1] === "black" )
                rgbHex = "000";
            else if ( matches[1] === "white" )
                rgbHex = "FFF";

            convertedParts.push('#' + rgbHex + alpha);
        }
        convertedCommaParts.push(convertedParts.join(' ').trim());
    }
    return convertedCommaParts.join(', ');
};

function checkInnerBrackets(string) {
    var convertedParts = [];
    var matches = BRACKETS_RE.exec(string);
    if ( !matches )
        return string;
    var parts = list.comma(matches[1]);
    for (var i = 0; i < parts.length; i++) {
        var part = parts[i];
        convertedParts.push(transformRgbAlpha(transformHexAlpha(transformBlackWhiteAlpha(part))));
    }
    return string.substr(0, matches.index) + '(' + convertedParts.join(', ') + ')';
}

function hexAlphaToRgba(hex, alpha) {
    return color('#'+hex).alpha(alpha).rgbaString();
}

function parseAlpha(alpha) {
    if ( alpha.indexOf('.') === -1 && alpha !== '1')
        alpha = '.' + alpha;
    if ( alpha === '1' )
        alpha = '';
    if ( alpha[0] === '0' )
        alpha = alpha.substr(1);
    return alpha;
}
