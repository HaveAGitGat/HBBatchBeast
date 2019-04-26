# deferential

es6 Native Promise Defer that helps build promise/callback dual APIS

[![build status](https://secure.travis-ci.org/eugeneware/deferential.png)](http://travis-ci.org/eugeneware/deferential)

## Installation

This module is installed via npm:

``` bash
$ npm install deferential
```

## Background

It is very easy to produce APIs that are equally consumable with node callbacks
as *well* as promises.

Various promise libraries such as
[Q](https://github.com/kriskowal/q/wiki/API-Reference#deferredmakenoderesolver)
and [bluebird](http://bluebirdjs.com/docs/api/ascallback.html) have methods
to either convert Promises or Deferred objects into forms that make it easy to
adapt existing node.js APIS to support these *DUAL* APIs.

However, as of ES6 (and node 0.12), Promises are native in Javascript, and thus
the need to have a heavy kitchen-sink API like Q or Bluebird is no longer
necessary as we get fast native-only implementations of Promises.

And we can easily polyfill these with great libries such as
[native-promise-only](https://github.com/getify/native-promise-only).

Thus, we can create some small focused, modules to add these additional
features that should work with any native Promise implementation.

## Making a dual API function

Say you have a regular function tht returns the contents of a file.

Here is the callback version:

``` js
var fs = require('fs');

function getFile(fileName, cb) {
  fs.readFile(fileName, 'utf8', cb);
}

getFile('myfile.text', function (err, data) {
  if (err) return console.error(err);
  console.log(data);
});
```

Here is the promise version:

``` js
var Promise = require('native-promise-only'),
    fs = require('fs');

function getFile(fileName, cb) {
  var p = new Promise(function (resolve, reject) {
    fs.readFile(fileName, 'utf8', function (err, data) {
      if (err) return reject(err);
      resolve(data);
    });
  });
  return p;
}

getFile('myfile.txt')
  .then(function (data) {
    console.log(data);
  })
  .catch(function (err) {
    console.error(err);
  });
```

Here is a version that supports both!

``` js
var Promise = require('native-promise-only'),
    fs = require('fs'),
    Deferred = require('deferential');

function getFile(fileName, cb) {
  var d = Deferred();
  fs.readFile(fileName, 'utf8', d.resolver());
  return d.nodeify(cb);
}

// Use with callback
getFile('myfile.text', function (err, data) {
  if (err) return console.error(err);
  console.log(data);
});

// Use with promise
getFile('myfile.txt')
  .then(function (data) {
    console.log(data);
  })
  .catch(function (err) {
    console.error(err);
  });
```

The first line creats a new `Deferred` object:

``` js
var d = Deferred();
```

The `d.resolver()` returns a callback `thunk` which a standard node.js
callback function can call, and then depending on the error state, it will
`resolve()` or `reject()` the underlying promise (represented as `d.promise`).

The last line detects whether a `cb` callback arguments was passed in, and if
it is, it will callback the supplied `cb` based on the success or failure of the
underlying promise:

``` js
return d.nodeify(cb);
```

If the `cb` argument is missing (ie. `undefined`) then `d.nodeify()` returns
the underlying promise so that the function can be used as a regular promise
and chained with `.then()` and `.catch()` calls.

So, in summary, if a `cb` parameter is passed in `d.nodeify()` will call the
callback as normal and all is good to use the function as a regular callback.

If the `cb` parameter is missing, then a promise is returned.

The `Deferred` object has `resolve()` and `reject()` methods on it to help
resolve/reject the state of the underlying `Promise`. But there is also a helper
method called `Deferred#resolver()` which returns a `thunk` that can easily
passed into the callback paramter of regular node.js functions to automate
the tedious `if (err) return d.reject(err)` logic.

## API

### `Deferred()`

Creates a new instance of a Deferred. It can be created with or without the
`new` operator.

### `Deferred#resolve(value)`

Resolve the underlying `Promise`.

### `Deferred#reject(err)`

Reject the underlying `Promise` with an error.

### `Deferred#promise`

Return the underlying `Promise`. NB: This is a Native Promise as the underlying
library uses [native-promise-only](https://github.com/getify/native-promise-only)
which will use the underlying Native `Promise` implementation or a native
polyfill without all the guff.

### `Deferred#resolver()`

Returns a node.js `thunk` (a function with the signature `cb(err, results)`.

Pass this to a node.js style callback and then based on the result of the
callback, the undelrying `Promise` will be resolved/rejected.

### `Deferred#nodeify(cb, [opts])`

Call the provided `cb` node.js callback function if the underlying promise
is resolved/rejected. If not, return the underlying promise to allow for
regular `Promise` thenable chaining.

* `cb` - node callback that will be called when the underlying `Deferred#promise`
  is resolved/rejected.
* `opts`:
  * `spread` - (default: `false`). When `true` when multiple return arguments
    are provided by the `#resolver()`, they will be mapped to additional
    return arguments in the callback. This is because `Promises` can only
    return a single value, whereas node.js callbacks can return multiple
    return values (eg. `cb(null, val1, val2)`. If this is `false` and
    multiple return values are returned, then the multiple values will
    be returned as a single array of the return values. See the tests for
    more details.
