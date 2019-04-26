# ArrayBuffer from String

Create an ArrayBuffer with the [raw bytes][javascript-encoding] from a String.

## Installation

```sh
npm install --save array-buffer-from-string
```

## Usage

```js
const arrayBufferFromString = require('array-buffer-from-string')

console.log(arrayBufferFromString('Hello world!'))
//=> ArrayBuffer { byteLength: 24 }
```

## API

### arrayBufferFromString(input: string) => ArrayBuffer

Create an ArrayBuffer with the [raw bytes][javascript-encoding] from a String.

[javascript-encoding]: https://mathiasbynens.be/notes/javascript-encoding

## See also

[hex-to-array-buffer](https://github.com/LinusU/hex-to-array-buffer) - Turn a string of hexadecimal characters into an `ArrayBuffer`
