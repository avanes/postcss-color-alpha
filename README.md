# PostCSS Color Alpha [![Build Status](https://travis-ci.org/avanes/postcss-color-alpha.svg)](https://travis-ci.org/avanes/postcss-color-alpha)

[PostCSS] plugin to transform color from '#rgb a' to rgba().

[PostCSS]: https://github.com/postcss/postcss

```css
/* Input examples */
.foo { color: black(.1) }
.bar { color: white(0.2); }
.baz { color: #0fc.3; }
.woo { color: #00ffcc.45; }
```

```css
/* Output examples */
.foo { color: rgba(0, 0, 0, 0.1); }
.bar { color: rgba(255, 255, 255, 0.2); }
.baz { color: rgba(0, 255, 204, 0.3); }
.woo { color: rgba(0, 255, 204, 0.45); }
```

## Usage

```js
postcss([ require('postcss-color-alpha') ])
```

See [PostCSS] docs for examples for your environment.
