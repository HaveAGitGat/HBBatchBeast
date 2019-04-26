# Base32 Encode

Base32 encoder with support for multiple variants.

## Installation

```sh
npm install --save base32-encode
```

## Usage

```js
const base32Encode = require('base32-encode')
const { buffer } = new Uint8Array([0x74, 0x65, 0x73, 0x74])

console.log(base32Encode(buffer, 'Crockford'))
//=> EHJQ6X0

console.log(base32Encode(buffer, 'RFC4648'))
//=> ORSXG5A=

console.log(base32Encode(buffer, 'RFC4648-HEX'))
//=> EHIN6T0=
```

## API

### base32Encode(buffer, variant)

- `buffer` &lt;ArrayBuffer&gt;
- `variant` &lt;String&gt;

Encode the data in `buffer`. `variant` should be one of the supported variants
listed below.

- `'RFC3548'` - Alias for `'RFC4648'`
- `'RFC4648'` - [Base32 from RFC4648](https://tools.ietf.org/html/rfc4648)
- `'RFC4648-HEX'` - [base32hex from RFC4648](https://tools.ietf.org/html/rfc4648)
- `'Crockford'` - [Crockford's Base32](http://www.crockford.com/wrmg/base32.html)

## See also

- [base32-decode](https://github.com/LinusU/base32-decode) - Base32 decoder
