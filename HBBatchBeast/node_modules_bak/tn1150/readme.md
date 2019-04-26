# TN1150

HFS Plus string utilities.

## Usage

```js
const tn1150 = require('tn1150')

// Sort filenames
filenames.sort(tn1150.compare)

// Normalize filename
filename = tn1150.normalize(filename)
```

## API

### `tn1150.compare(lhs: string, rhs: string) -> number`

Compare two strings using the algorithm from TN1150. Useful for sorting
filenames.

### `tn1150.normalize(text: string) -> string`

Normalize a string using Unicode Canonical Decomposition.
