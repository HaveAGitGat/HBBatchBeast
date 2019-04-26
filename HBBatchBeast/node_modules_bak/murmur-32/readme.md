# MurmurHash3 32-bit

MurmurHash3 x86 32-bit implemented in JavaScript.

## Installation

```sh
npm install --save murmur-32
```

## Usage

```js
const murmur32 = require('murmur-32')

murmur32('linus')
//=> ArrayBuffer { 4 }

murmur32(new ArrayBuffer(10))
//=> ArrayBuffer { 4 }
```

## API

### murmur32(key: ArrayBuffer | string) => ArrayBuffer

Compute the 32-bit MurmurHash3 of the supplied `key`. If the `key` is given as
string the [raw bytes that it occupies][javascript-encoding] will be used.

[javascript-encoding]: https://mathiasbynens.be/notes/javascript-encoding

## See also

- [murmur-128](https://github.com/LinusU/murmur-128) - MurmurHash3 x86 128-bit implemented in JavaScript
