'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.convert = exports.arr2str = exports.encode = undefined;
exports.decode = decode;

var _textEncoding = require('text-encoding');

/**
 * Encodes an unicode string into an Uint8Array object as UTF-8
 *
 * @param {String} str String to be encoded
 * @return {Uint8Array} UTF-8 encoded typed array
 */
var encode = exports.encode = function encode(str) {
  return new _textEncoding.TextEncoder('UTF-8').encode(str);
};

var arr2str = exports.arr2str = function arr2str(arr) {
  return String.fromCharCode.apply(null, arr

  /**
   * Decodes a string from Uint8Array to an unicode string using specified encoding
   *
   * @param {Uint8Array} buf Binary data to be decoded
   * @param {String} Binary data is decoded into string using this charset
   * @return {String} Decoded string
   */
  );
};function decode(buf) {
  var fromCharset = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'utf-8';

  var charsets = [{ charset: normalizeCharset(fromCharset), fatal: false }, { charset: 'utf-8', fatal: true }, { charset: 'iso-8859-15', fatal: false }];

  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = charsets[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var _step$value = _step.value,
          charset = _step$value.charset,
          fatal = _step$value.fatal;

      try {
        return new _textEncoding.TextDecoder(charset, { fatal: fatal }).decode(buf);
      } catch (e) {}
    }
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion && _iterator.return) {
        _iterator.return();
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }

  return arr2str(buf // all else fails, treat it as binary
  );
}

/**
 * Convert a string from specific encoding to UTF-8 Uint8Array
 *
 * @param {String|Uint8Array} data Data to be encoded
 * @param {String} Source encoding for the string (optional for data of type String)
 * @return {Uint8Array} UTF-8 encoded typed array
 */
var convert = exports.convert = function convert(data, fromCharset) {
  return typeof data === 'string' ? encode(data) : encode(decode(data, fromCharset));
};

function normalizeCharset() {
  var charset = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'utf-8';

  var match = void 0;

  if (match = charset.match(/^utf[-_]?(\d+)$/i)) {
    return 'UTF-' + match[1];
  }

  if (match = charset.match(/^win[-_]?(\d+)$/i)) {
    return 'WINDOWS-' + match[1];
  }

  if (match = charset.match(/^latin[-_]?(\d+)$/i)) {
    return 'ISO-8859-' + match[1];
  }

  return charset;
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9jaGFyc2V0LmpzIl0sIm5hbWVzIjpbImRlY29kZSIsImVuY29kZSIsIlRleHRFbmNvZGVyIiwic3RyIiwiYXJyMnN0ciIsIlN0cmluZyIsImZyb21DaGFyQ29kZSIsImFwcGx5IiwiYXJyIiwiYnVmIiwiZnJvbUNoYXJzZXQiLCJjaGFyc2V0cyIsImNoYXJzZXQiLCJub3JtYWxpemVDaGFyc2V0IiwiZmF0YWwiLCJUZXh0RGVjb2RlciIsImUiLCJjb252ZXJ0IiwiZGF0YSIsIm1hdGNoIl0sIm1hcHBpbmdzIjoiOzs7Ozs7UUFtQmdCQSxNLEdBQUFBLE07O0FBbkJoQjs7QUFFQTs7Ozs7O0FBTU8sSUFBTUMsMEJBQVMsU0FBVEEsTUFBUztBQUFBLFNBQU8sSUFBSUMseUJBQUosQ0FBZ0IsT0FBaEIsRUFBeUJELE1BQXpCLENBQWdDRSxHQUFoQyxDQUFQO0FBQUEsQ0FBZjs7QUFFQSxJQUFNQyw0QkFBVSxTQUFWQSxPQUFVO0FBQUEsU0FBT0MsT0FBT0MsWUFBUCxDQUFvQkMsS0FBcEIsQ0FBMEIsSUFBMUIsRUFBZ0NDOztBQUU5RDs7Ozs7OztBQUY4QixHQUFQO0FBQUEsQ0FBaEIsQ0FTQSxTQUFTUixNQUFULENBQWlCUyxHQUFqQixFQUE2QztBQUFBLE1BQXZCQyxXQUF1Qix1RUFBVCxPQUFTOztBQUNsRCxNQUFNQyxXQUFXLENBQ2YsRUFBRUMsU0FBU0MsaUJBQWlCSCxXQUFqQixDQUFYLEVBQTBDSSxPQUFPLEtBQWpELEVBRGUsRUFFZixFQUFFRixTQUFTLE9BQVgsRUFBb0JFLE9BQU8sSUFBM0IsRUFGZSxFQUdmLEVBQUVGLFNBQVMsYUFBWCxFQUEwQkUsT0FBTyxLQUFqQyxFQUhlLENBQWpCOztBQURrRDtBQUFBO0FBQUE7O0FBQUE7QUFPbEQseUJBQStCSCxRQUEvQiw4SEFBeUM7QUFBQTtBQUFBLFVBQTdCQyxPQUE2QixlQUE3QkEsT0FBNkI7QUFBQSxVQUFwQkUsS0FBb0IsZUFBcEJBLEtBQW9COztBQUN2QyxVQUFJO0FBQUUsZUFBTyxJQUFJQyx5QkFBSixDQUFnQkgsT0FBaEIsRUFBeUIsRUFBRUUsWUFBRixFQUF6QixFQUFvQ2QsTUFBcEMsQ0FBMkNTLEdBQTNDLENBQVA7QUFBd0QsT0FBOUQsQ0FBK0QsT0FBT08sQ0FBUCxFQUFVLENBQUc7QUFDN0U7QUFUaUQ7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTs7QUFXbEQsU0FBT1osUUFBUUssR0FBUixDQUFhO0FBQWIsR0FBUDtBQUNEOztBQUVEOzs7Ozs7O0FBT08sSUFBTVEsNEJBQVUsU0FBVkEsT0FBVSxDQUFDQyxJQUFELEVBQU9SLFdBQVA7QUFBQSxTQUF1QixPQUFPUSxJQUFQLEtBQWdCLFFBQWhCLEdBQTJCakIsT0FBT2lCLElBQVAsQ0FBM0IsR0FBMENqQixPQUFPRCxPQUFPa0IsSUFBUCxFQUFhUixXQUFiLENBQVAsQ0FBakU7QUFBQSxDQUFoQjs7QUFFUCxTQUFTRyxnQkFBVCxHQUE4QztBQUFBLE1BQW5CRCxPQUFtQix1RUFBVCxPQUFTOztBQUM1QyxNQUFJTyxjQUFKOztBQUVBLE1BQUtBLFFBQVFQLFFBQVFPLEtBQVIsQ0FBYyxrQkFBZCxDQUFiLEVBQWlEO0FBQy9DLFdBQU8sU0FBU0EsTUFBTSxDQUFOLENBQWhCO0FBQ0Q7O0FBRUQsTUFBS0EsUUFBUVAsUUFBUU8sS0FBUixDQUFjLGtCQUFkLENBQWIsRUFBaUQ7QUFDL0MsV0FBTyxhQUFhQSxNQUFNLENBQU4sQ0FBcEI7QUFDRDs7QUFFRCxNQUFLQSxRQUFRUCxRQUFRTyxLQUFSLENBQWMsb0JBQWQsQ0FBYixFQUFtRDtBQUNqRCxXQUFPLGNBQWNBLE1BQU0sQ0FBTixDQUFyQjtBQUNEOztBQUVELFNBQU9QLE9BQVA7QUFDRCIsImZpbGUiOiJjaGFyc2V0LmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgVGV4dERlY29kZXIsIFRleHRFbmNvZGVyIH0gZnJvbSAndGV4dC1lbmNvZGluZydcblxuLyoqXG4gKiBFbmNvZGVzIGFuIHVuaWNvZGUgc3RyaW5nIGludG8gYW4gVWludDhBcnJheSBvYmplY3QgYXMgVVRGLThcbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gc3RyIFN0cmluZyB0byBiZSBlbmNvZGVkXG4gKiBAcmV0dXJuIHtVaW50OEFycmF5fSBVVEYtOCBlbmNvZGVkIHR5cGVkIGFycmF5XG4gKi9cbmV4cG9ydCBjb25zdCBlbmNvZGUgPSBzdHIgPT4gbmV3IFRleHRFbmNvZGVyKCdVVEYtOCcpLmVuY29kZShzdHIpXG5cbmV4cG9ydCBjb25zdCBhcnIyc3RyID0gYXJyID0+IFN0cmluZy5mcm9tQ2hhckNvZGUuYXBwbHkobnVsbCwgYXJyKVxuXG4vKipcbiAqIERlY29kZXMgYSBzdHJpbmcgZnJvbSBVaW50OEFycmF5IHRvIGFuIHVuaWNvZGUgc3RyaW5nIHVzaW5nIHNwZWNpZmllZCBlbmNvZGluZ1xuICpcbiAqIEBwYXJhbSB7VWludDhBcnJheX0gYnVmIEJpbmFyeSBkYXRhIHRvIGJlIGRlY29kZWRcbiAqIEBwYXJhbSB7U3RyaW5nfSBCaW5hcnkgZGF0YSBpcyBkZWNvZGVkIGludG8gc3RyaW5nIHVzaW5nIHRoaXMgY2hhcnNldFxuICogQHJldHVybiB7U3RyaW5nfSBEZWNvZGVkIHN0cmluZ1xuICovXG5leHBvcnQgZnVuY3Rpb24gZGVjb2RlIChidWYsIGZyb21DaGFyc2V0ID0gJ3V0Zi04Jykge1xuICBjb25zdCBjaGFyc2V0cyA9IFtcbiAgICB7IGNoYXJzZXQ6IG5vcm1hbGl6ZUNoYXJzZXQoZnJvbUNoYXJzZXQpLCBmYXRhbDogZmFsc2UgfSxcbiAgICB7IGNoYXJzZXQ6ICd1dGYtOCcsIGZhdGFsOiB0cnVlIH0sXG4gICAgeyBjaGFyc2V0OiAnaXNvLTg4NTktMTUnLCBmYXRhbDogZmFsc2UgfVxuICBdXG5cbiAgZm9yIChjb25zdCB7Y2hhcnNldCwgZmF0YWx9IG9mIGNoYXJzZXRzKSB7XG4gICAgdHJ5IHsgcmV0dXJuIG5ldyBUZXh0RGVjb2RlcihjaGFyc2V0LCB7IGZhdGFsIH0pLmRlY29kZShidWYpIH0gY2F0Y2ggKGUpIHsgfVxuICB9XG5cbiAgcmV0dXJuIGFycjJzdHIoYnVmKSAvLyBhbGwgZWxzZSBmYWlscywgdHJlYXQgaXQgYXMgYmluYXJ5XG59XG5cbi8qKlxuICogQ29udmVydCBhIHN0cmluZyBmcm9tIHNwZWNpZmljIGVuY29kaW5nIHRvIFVURi04IFVpbnQ4QXJyYXlcbiAqXG4gKiBAcGFyYW0ge1N0cmluZ3xVaW50OEFycmF5fSBkYXRhIERhdGEgdG8gYmUgZW5jb2RlZFxuICogQHBhcmFtIHtTdHJpbmd9IFNvdXJjZSBlbmNvZGluZyBmb3IgdGhlIHN0cmluZyAob3B0aW9uYWwgZm9yIGRhdGEgb2YgdHlwZSBTdHJpbmcpXG4gKiBAcmV0dXJuIHtVaW50OEFycmF5fSBVVEYtOCBlbmNvZGVkIHR5cGVkIGFycmF5XG4gKi9cbmV4cG9ydCBjb25zdCBjb252ZXJ0ID0gKGRhdGEsIGZyb21DaGFyc2V0KSA9PiB0eXBlb2YgZGF0YSA9PT0gJ3N0cmluZycgPyBlbmNvZGUoZGF0YSkgOiBlbmNvZGUoZGVjb2RlKGRhdGEsIGZyb21DaGFyc2V0KSlcblxuZnVuY3Rpb24gbm9ybWFsaXplQ2hhcnNldCAoY2hhcnNldCA9ICd1dGYtOCcpIHtcbiAgbGV0IG1hdGNoXG5cbiAgaWYgKChtYXRjaCA9IGNoYXJzZXQubWF0Y2goL151dGZbLV9dPyhcXGQrKSQvaSkpKSB7XG4gICAgcmV0dXJuICdVVEYtJyArIG1hdGNoWzFdXG4gIH1cblxuICBpZiAoKG1hdGNoID0gY2hhcnNldC5tYXRjaCgvXndpblstX10/KFxcZCspJC9pKSkpIHtcbiAgICByZXR1cm4gJ1dJTkRPV1MtJyArIG1hdGNoWzFdXG4gIH1cblxuICBpZiAoKG1hdGNoID0gY2hhcnNldC5tYXRjaCgvXmxhdGluWy1fXT8oXFxkKykkL2kpKSkge1xuICAgIHJldHVybiAnSVNPLTg4NTktJyArIG1hdGNoWzFdXG4gIH1cblxuICByZXR1cm4gY2hhcnNldFxufVxuIl19