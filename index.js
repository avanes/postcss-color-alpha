var postcss = require("postcss"),
    color = require("color"),
    messageHelpers = require("postcss-message-helpers"),
    list = postcss.list;

var HEX_A_RE    = /#([0-9a-f]{3}|[0-9a-f]{6})(\.\d+)\b/i,
    BW_RE       = /(black|white)\((0?\.?\d+)?\)/i,
    BW_RE_2     = /^(black|white)\((0?\.?\d+)?\)/i,
    RGBA_RE     = /rgba\(#([0-9a-f]{3}|[0-9a-f]{6}),\ ?(0?\.?\d+)\)/i,
    RGBA_RGB_RE = /rgba\((rgb\([0-9]{1,3},\ ?[0-9]{1,3},\ ?[0-9]{1,3}\)),\ ?(0?\.?\d+)\)/i,
    BRACKETS_RE = /\((..*)\)/;

module.exports = postcss.plugin('postcss-color-alpha', function (opts) {
    return function (css, result) {
        // Transform CSS AST here
        css.walkDecls(function transformDecl(decl) {
            if ( !decl.value || !(
                    decl.value.match(HEX_A_RE) ||
                    decl.value.match(BW_RE)    ||
                    decl.value.match(RGBA_RE)  ||
                    decl.value.match(RGBA_RGB_RE)
                )
            ) {
                return;
            }

            decl.value = messageHelpers.try(function () {
                return converter(decl.value);
            });
        });
    };
});

var converter = function (string) {
    return transformRgbRgbAlpha(
        transformRgbAlpha(
            transformHexAlpha(
                transformBlackWhiteAlpha(string)
            )
        )
    );
};

var parser = function(string, matcher, matcher2, callback) {
    var convertedCommaParts = [];
    var commaParts = list.comma(string);

    for (var i = 0; i < commaParts.length; i++) {
        var convertedParts = [];
        var parts = list.space(commaParts[i]);
        for (var j = 0; j < parts.length; j++) {
            var part = parts[j];

            var matches = matcher2.exec(part);
            if ( !matches ) {
                convertedParts.push(checkInnerBrackets(part));
                continue;
            }

            convertedParts.push(callback(matches));

        }
        convertedCommaParts.push(convertedParts.join(' ').trim());
    }
    return convertedCommaParts.join(', ');
};

var transformRgbRgbAlpha = function(string) {
    return parser(string, RGBA_RGB_RE, RGBA_RGB_RE, function(matches){
        return color(matches[1]).alpha(matches[2]).rgbaString();
    });
};

var transformRgbAlpha = function(string) {
    return parser(string, RGBA_RE, RGBA_RE, function(matches) {
        return color('#'+matches[1])
            .alpha(parseAlpha(matches[2]))
            .rgbaString();
    });
};

var transformHexAlpha = function(string) {
    return parser(string, HEX_A_RE, HEX_A_RE, function(matches) {
        var rgbHex = matches[1];
        if ( matches[1] === "black" )
            rgbHex = "000";
        else if ( matches[1] === "white" )
            rgbHex = "FFF";

        var alpha  = matches[2];
        if ( typeof alpha === 'undefined' )
            alpha = '.0';
        alpha = parseAlpha(alpha);

        return color('#' + rgbHex)
            .alpha(alpha)
            .rgbaString();
    });
};

var transformBlackWhiteAlpha = function(string) {
    return parser(string, BW_RE, BW_RE_2, function(matches) {
        var alpha, rgbHex;

        alpha = matches[2];
        if ( typeof alpha === 'undefined' )
            alpha = '.0';
        alpha = parseAlpha(alpha);

        if ( matches[1] === "black" )
            rgbHex = "000";
        else if ( matches[1] === "white" )
            rgbHex = "FFF";
        return '#' + rgbHex + alpha;
    });
};

var checkInnerBrackets = function(string) {
    var convertedParts = [];
    var matches = BRACKETS_RE.exec(string);
    if ( !matches )
        return string;
    var parts = list.comma(matches[1]);
    for (var i = 0; i < parts.length; i++) {
        var part = parts[i];
        convertedParts.push(converter(part));
    }
    return string.substr(0, matches.index) + '(' + convertedParts.join(', ') + ')';
};

var parseAlpha = function(alpha) {
    if ( alpha.indexOf('.') === -1 && alpha !== '1')
        alpha = '.' + alpha;
    if ( alpha === '1' )
        alpha = '';
    if ( alpha[0] === '0' )
        alpha = alpha.substr(1);
    return alpha;
};
