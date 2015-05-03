# PostCSS Color Alpha [![Build Status](https://travis-ci.org/avanes/postcss-color-alpha.svg)](https://travis-ci.org/avanes/postcss-color-alpha)  [![NPM version](https://badge.fury.io/js/postcss-color-alpha.svg)](https://www.npmjs.org/package/postcss-color-alpha)

[PostCSS] plugin to transform color from `#rgb.a` to `rgba()`.

[PostCSS]: https://github.com/postcss/postcss

```css
/* Input examples */
.foo { color: black(.1) }
.bar { color: white(0.2); }
.baz { color: #0fc.3; }
.woo { color: #00ffcc.45; }
.hoo { border-color: #000 #000.5 white white(0.5); }
.boo { text-shadow: 1px 1px 1px #0fc.1, 3px 3px 5px rgba(#fff, .5); }
```

```css
/* Output examples */
.foo { color: rgba(0, 0, 0, 0.1); }
.bar { color: rgba(255, 255, 255, 0.2); }
.baz { color: rgba(0, 255, 204, 0.3); }
.woo { color: rgba(0, 255, 204, 0.45); }
.hoo { border-color: #000 rgba(0, 0, 0, 0.5) white rgba(255, 255, 255, 0.5); }
.boo { text-shadow: 1px 1px 1px rgba(0, 255, 204, 0.1), 3px 3px 5px rgba(255, 255, 255, 0.5); }
```

## Install

```sh
$ npm install postcss-color-alpha
```

## Usage

```js
postcss([ require('postcss-color-alpha') ])
```

See [PostCSS] docs for examples for your environment.
