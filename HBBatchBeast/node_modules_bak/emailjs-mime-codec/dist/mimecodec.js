'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.convert = exports.encode = exports.decode = undefined;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

exports.mimeEncode = mimeEncode;
exports.mimeDecode = mimeDecode;
exports.base64Encode = base64Encode;
exports.base64Decode = base64Decode;
exports.quotedPrintableEncode = quotedPrintableEncode;
exports.quotedPrintableDecode = quotedPrintableDecode;
exports.mimeWordEncode = mimeWordEncode;
exports.mimeWordsEncode = mimeWordsEncode;
exports.mimeWordDecode = mimeWordDecode;
exports.mimeWordsDecode = mimeWordsDecode;
exports.foldLines = foldLines;
exports.headerLineEncode = headerLineEncode;
exports.headerLineDecode = headerLineDecode;
exports.headerLinesDecode = headerLinesDecode;
exports.parseHeaderValue = parseHeaderValue;
exports.continuationEncode = continuationEncode;

var _emailjsBase = require('emailjs-base64');

var _charset = require('./charset');

var _ramda = require('ramda');

// Lines can't be longer than 76 + <CR><LF> = 78 bytes
// http://tools.ietf.org/html/rfc2045#section-6.7
var MAX_LINE_LENGTH = 76;
var MAX_MIME_WORD_LENGTH = 52;
var MAX_B64_MIME_WORD_BYTE_LENGTH = 39;

/**
 * Encodes all non printable and non ascii bytes to =XX form, where XX is the
 * byte value in hex. This function does not convert linebreaks etc. it
 * only escapes character sequences
 *
 * @param {String|Uint8Array} data Either a string or an Uint8Array
 * @param {String} [fromCharset='UTF-8'] Source encoding
 * @return {String} Mime encoded string
 */
function mimeEncode() {
  var data = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
  var fromCharset = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'UTF-8';

  var buffer = (0, _charset.convert)(data, fromCharset);
  return buffer.reduce(function (aggregate, ord, index) {
    return _checkRanges(ord) && !((ord === 0x20 || ord === 0x09) && (index === buffer.length - 1 || buffer[index + 1] === 0x0a || buffer[index + 1] === 0x0d)) ? aggregate + String.fromCharCode(ord // if the char is in allowed range, then keep as is, unless it is a ws in the end of a line
    ) : aggregate + '=' + (ord < 0x10 ? '0' : '') + ord.toString(16).toUpperCase();
  }, '');

  function _checkRanges(nr) {
    var ranges = [// https://tools.ietf.org/html/rfc2045#section-6.7
    [0x09], // <TAB>
    [0x0A], // <LF>
    [0x0D], // <CR>
    [0x20, 0x3C], // <SP>!"#$%&'()*+,-./0123456789:;
    [0x3E, 0x7E] // >?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\]^_`abcdefghijklmnopqrstuvwxyz{|}
    ];
    return ranges.reduce(function (val, range) {
      return val || range.length === 1 && nr === range[0] || range.length === 2 && nr >= range[0] && nr <= range[1];
    }, false);
  }
}

/**
 * Decodes mime encoded string to an unicode string
 *
 * @param {String} str Mime encoded string
 * @param {String} [fromCharset='UTF-8'] Source encoding
 * @return {String} Decoded unicode string
 */
function mimeDecode() {
  var str = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
  var fromCharset = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'UTF-8';

  var encodedBytesCount = (str.match(/=[\da-fA-F]{2}/g) || []).length;
  var buffer = new Uint8Array(str.length - encodedBytesCount * 2);

  for (var i = 0, len = str.length, bufferPos = 0; i < len; i++) {
    var hex = str.substr(i + 1, 2);
    var chr = str.charAt(i);
    if (chr === '=' && hex && /[\da-fA-F]{2}/.test(hex)) {
      buffer[bufferPos++] = parseInt(hex, 16);
      i += 2;
    } else {
      buffer[bufferPos++] = chr.charCodeAt(0);
    }
  }

  return (0, _charset.decode)(buffer, fromCharset);
}

/**
 * Encodes a string or an typed array of given charset into unicode
 * base64 string. Also adds line breaks
 *
 * @param {String|Uint8Array} data String or typed array to be base64 encoded
 * @param {String} Initial charset, e.g. 'binary'. Defaults to 'UTF-8'
 * @return {String} Base64 encoded string
 */
function base64Encode(data) {
  var fromCharset = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'UTF-8';

  var buf = typeof data !== 'string' && fromCharset === 'binary' ? data : (0, _charset.convert)(data, fromCharset);
  var b64 = (0, _emailjsBase.encode)(buf);
  return _addBase64SoftLinebreaks(b64);
}

/**
 * Decodes a base64 string of any charset into an unicode string
 *
 * @param {String} str Base64 encoded string
 * @param {String} [fromCharset='UTF-8'] Original charset of the base64 encoded string
 * @return {String} Decoded unicode string
 */
function base64Decode(str, fromCharset) {
  var buf = (0, _emailjsBase.decode)(str, _emailjsBase.OUTPUT_TYPED_ARRAY);
  return fromCharset === 'binary' ? (0, _charset.arr2str)(buf) : (0, _charset.decode)(buf, fromCharset);
}

/**
 * Encodes a string or an Uint8Array into a quoted printable encoding
 * This is almost the same as mimeEncode, except line breaks will be changed
 * as well to ensure that the lines are never longer than allowed length
 *
 * @param {String|Uint8Array} data String or an Uint8Array to mime encode
 * @param {String} [fromCharset='UTF-8'] Original charset of the string
 * @return {String} Mime encoded string
 */
function quotedPrintableEncode() {
  var data = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
  var fromCharset = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'UTF-8';

  var mimeEncodedStr = mimeEncode(data, fromCharset).replace(/\r?\n|\r/g, '\r\n' // fix line breaks, ensure <CR><LF>
  ).replace(/[\t ]+$/gm, function (spaces) {
    return spaces.replace(/ /g, '=20').replace(/\t/g, '=09');
  } // replace spaces in the end of lines

  );return _addQPSoftLinebreaks(mimeEncodedStr // add soft line breaks to ensure line lengths sjorter than 76 bytes
  );
}

/**
 * Decodes a string from a quoted printable encoding. This is almost the
 * same as mimeDecode, except line breaks will be changed as well
 *
 * @param {String} str Mime encoded string to decode
 * @param {String} [fromCharset='UTF-8'] Original charset of the string
 * @return {String} Mime decoded string
 */
function quotedPrintableDecode() {
  var str = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
  var fromCharset = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'UTF-8';

  var rawString = str.replace(/[\t ]+$/gm, '' // remove invalid whitespace from the end of lines
  ).replace(/=(?:\r?\n|$)/g, '' // remove soft line breaks

  );return mimeDecode(rawString, fromCharset);
}

/**
 * Encodes a string or an Uint8Array to an UTF-8 MIME Word
 *   https://tools.ietf.org/html/rfc2047
 *
 * @param {String|Uint8Array} data String to be encoded
 * @param {String} mimeWordEncoding='Q' Encoding for the mime word, either Q or B
 * @param {String} [fromCharset='UTF-8'] Source sharacter set
 * @return {String} Single or several mime words joined together
 */
function mimeWordEncode(data) {
  var mimeWordEncoding = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'Q';
  var fromCharset = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'UTF-8';

  var parts = [];
  var str = typeof data === 'string' ? data : (0, _charset.decode)(data, fromCharset);

  if (mimeWordEncoding === 'Q') {
    var _str = typeof data === 'string' ? data : (0, _charset.decode)(data, fromCharset);
    var encodedStr = (0, _ramda.pipe)(mimeEncode, qEncodeForbiddenHeaderChars)(_str);
    parts = encodedStr.length < MAX_MIME_WORD_LENGTH ? [encodedStr] : _splitMimeEncodedString(encodedStr, MAX_MIME_WORD_LENGTH);
  } else {
    // Fits as much as possible into every line without breaking utf-8 multibyte characters' octets up across lines
    var j = 0;
    var i = 0;
    while (i < str.length) {
      if ((0, _charset.encode)(str.substring(j, i)).length > MAX_B64_MIME_WORD_BYTE_LENGTH) {
        // we went one character too far, substring at the char before
        parts.push(str.substring(j, i - 1));
        j = i - 1;
      } else {
        i++;
      }
    }
    // add the remainder of the string
    str.substring(j) && parts.push(str.substring(j));
    parts = parts.map(_charset.encode).map(_emailjsBase.encode);
  }

  var prefix = '=?UTF-8?' + mimeWordEncoding + '?';
  var suffix = '?= ';
  return parts.map(function (p) {
    return prefix + p + suffix;
  }).join('').trim();
}

/**
 * Q-Encodes remaining forbidden header chars
 *   https://tools.ietf.org/html/rfc2047#section-5
 */
var qEncodeForbiddenHeaderChars = function qEncodeForbiddenHeaderChars(str) {
  var qEncode = function qEncode(chr) {
    return chr === ' ' ? '_' : '=' + (chr.charCodeAt(0) < 0x10 ? '0' : '') + chr.charCodeAt(0).toString(16).toUpperCase();
  };
  return str.replace(/[^a-z0-9!*+\-/=]/ig, qEncode);
};

/**
 * Finds word sequences with non ascii text and converts these to mime words
 *
 * @param {String|Uint8Array} data String to be encoded
 * @param {String} mimeWordEncoding='Q' Encoding for the mime word, either Q or B
 * @param {String} [fromCharset='UTF-8'] Source sharacter set
 * @return {String} String with possible mime words
 */
function mimeWordsEncode() {
  var data = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
  var mimeWordEncoding = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'Q';
  var fromCharset = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'UTF-8';

  var regex = /([^\s\u0080-\uFFFF]*[\u0080-\uFFFF]+[^\s\u0080-\uFFFF]*(?:\s+[^\s\u0080-\uFFFF]*[\u0080-\uFFFF]+[^\s\u0080-\uFFFF]*\s*)?)+(?=\s|$)/g;
  return (0, _charset.decode)((0, _charset.convert)(data, fromCharset)).replace(regex, function (match) {
    return match.length ? mimeWordEncode(match, mimeWordEncoding, fromCharset) : '';
  });
}

/**
 * Decode a complete mime word encoded string
 *
 * @param {String} str Mime word encoded string
 * @return {String} Decoded unicode string
 */
function mimeWordDecode() {
  var str = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';

  var match = str.match(/^=\?([\w_\-*]+)\?([QqBb])\?([^?]*)\?=$/i);
  if (!match) return str;

  // RFC2231 added language tag to the encoding
  // see: https://tools.ietf.org/html/rfc2231#section-5
  // this implementation silently ignores this tag
  var fromCharset = match[1].split('*').shift();
  var encoding = (match[2] || 'Q').toString().toUpperCase();
  var rawString = (match[3] || '').replace(/_/g, ' ');

  if (encoding === 'B') {
    return base64Decode(rawString, fromCharset);
  } else if (encoding === 'Q') {
    return mimeDecode(rawString, fromCharset);
  } else {
    return str;
  }
}

/**
 * Decode a string that might include one or several mime words
 *
 * @param {String} str String including some mime words that will be encoded
 * @return {String} Decoded unicode string
 */
function mimeWordsDecode() {
  var str = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';

  str = str.toString().replace(/(=\?[^?]+\?[QqBb]\?[^?]+\?=)\s+(?==\?[^?]+\?[QqBb]\?[^?]*\?=)/g, '$1'
  // join bytes of multi-byte UTF-8
  );var prevEncoding = void 0;
  str = str.replace(/(\?=)?=\?[uU][tT][fF]-8\?([QqBb])\?/g, function (match, endOfPrevWord, encoding) {
    var result = endOfPrevWord && encoding === prevEncoding ? '' : match;
    prevEncoding = encoding;
    return result;
  });
  str = str.replace(/=\?[\w_\-*]+\?[QqBb]\?[^?]*\?=/g, function (mimeWord) {
    return mimeWordDecode(mimeWord.replace(/\s+/g, ''));
  });

  return str;
}

/**
 * Folds long lines, useful for folding header lines (afterSpace=false) and
 * flowed text (afterSpace=true)
 *
 * @param {String} str String to be folded
 * @param {Boolean} afterSpace If true, leave a space in th end of a line
 * @return {String} String with folded lines
 */
function foldLines() {
  var str = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
  var afterSpace = arguments[1];

  var pos = 0;
  var len = str.length;
  var result = '';
  var line = void 0,
      match = void 0;

  while (pos < len) {
    line = str.substr(pos, MAX_LINE_LENGTH);
    if (line.length < MAX_LINE_LENGTH) {
      result += line;
      break;
    }
    if (match = line.match(/^[^\n\r]*(\r?\n|\r)/)) {
      line = match[0];
      result += line;
      pos += line.length;
      continue;
    } else if ((match = line.match(/(\s+)[^\s]*$/)) && match[0].length - (afterSpace ? (match[1] || '').length : 0) < line.length) {
      line = line.substr(0, line.length - (match[0].length - (afterSpace ? (match[1] || '').length : 0)));
    } else if (match = str.substr(pos + line.length).match(/^[^\s]+(\s*)/)) {
      line = line + match[0].substr(0, match[0].length - (!afterSpace ? (match[1] || '').length : 0));
    }

    result += line;
    pos += line.length;
    if (pos < len) {
      result += '\r\n';
    }
  }

  return result;
}

/**
 * Encodes and folds a header line for a MIME message header.
 * Shorthand for mimeWordsEncode + foldLines
 *
 * @param {String} key Key name, will not be encoded
 * @param {String|Uint8Array} value Value to be encoded
 * @param {String} [fromCharset='UTF-8'] Character set of the value
 * @return {String} encoded and folded header line
 */
function headerLineEncode(key, value, fromCharset) {
  var encodedValue = mimeWordsEncode(value, 'Q', fromCharset);
  return foldLines(key + ': ' + encodedValue);
}

/**
 * The result is not mime word decoded, you need to do your own decoding based
 * on the rules for the specific header key
 *
 * @param {String} headerLine Single header line, might include linebreaks as well if folded
 * @return {Object} And object of {key, value}
 */
function headerLineDecode() {
  var headerLine = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';

  var line = headerLine.toString().replace(/(?:\r?\n|\r)[ \t]*/g, ' ').trim();
  var match = line.match(/^\s*([^:]+):(.*)$/);

  return {
    key: (match && match[1] || '').trim(),
    value: (match && match[2] || '').trim()
  };
}

/**
 * Parses a block of header lines. Does not decode mime words as every
 * header might have its own rules (eg. formatted email addresses and such)
 *
 * @param {String} headers Headers string
 * @return {Object} An object of headers, where header keys are object keys. NB! Several values with the same key make up an Array
 */
function headerLinesDecode(headers) {
  var lines = headers.split(/\r?\n|\r/);
  var headersObj = {};

  for (var i = lines.length - 1; i >= 0; i--) {
    if (i && lines[i].match(/^\s/)) {
      lines[i - 1] += '\r\n' + lines[i];
      lines.splice(i, 1);
    }
  }

  for (var _i = 0, len = lines.length; _i < len; _i++) {
    var header = headerLineDecode(lines[_i]);
    var key = header.key.toLowerCase();
    var value = header.value;

    if (!headersObj[key]) {
      headersObj[key] = value;
    } else {
      headersObj[key] = [].concat(headersObj[key], value);
    }
  }

  return headersObj;
}

/**
 * Parses a header value with key=value arguments into a structured
 * object.
 *
 *   parseHeaderValue('content-type: text/plain; CHARSET='UTF-8'') ->
 *   {
 *     'value': 'text/plain',
 *     'params': {
 *       'charset': 'UTF-8'
 *     }
 *   }
 *
 * @param {String} str Header value
 * @return {Object} Header value as a parsed structure
 */
function parseHeaderValue(str) {
  var response = {
    value: false,
    params: {}
  };
  var key = false;
  var value = '';
  var type = 'value';
  var quote = false;
  var escaped = false;
  var chr = void 0;

  for (var i = 0, len = str.length; i < len; i++) {
    chr = str.charAt(i);
    if (type === 'key') {
      if (chr === '=') {
        key = value.trim().toLowerCase();
        type = 'value';
        value = '';
        continue;
      }
      value += chr;
    } else {
      if (escaped) {
        value += chr;
      } else if (chr === '\\') {
        escaped = true;
        continue;
      } else if (quote && chr === quote) {
        quote = false;
      } else if (!quote && chr === '"') {
        quote = chr;
      } else if (!quote && chr === ';') {
        if (key === false) {
          response.value = value.trim();
        } else {
          response.params[key] = value.trim();
        }
        type = 'key';
        value = '';
      } else {
        value += chr;
      }
      escaped = false;
    }
  }

  if (type === 'value') {
    if (key === false) {
      response.value = value.trim();
    } else {
      response.params[key] = value.trim();
    }
  } else if (value.trim()) {
    response.params[value.trim().toLowerCase()] = '';
  }

  // handle parameter value continuations
  // https://tools.ietf.org/html/rfc2231#section-3

  // preprocess values
  Object.keys(response.params).forEach(function (key) {
    var actualKey, nr, match, value;
    if (match = key.match(/(\*(\d+)|\*(\d+)\*|\*)$/)) {
      actualKey = key.substr(0, match.index);
      nr = Number(match[2] || match[3]) || 0;

      if (!response.params[actualKey] || _typeof(response.params[actualKey]) !== 'object') {
        response.params[actualKey] = {
          charset: false,
          values: []
        };
      }

      value = response.params[key];

      if (nr === 0 && match[0].substr(-1) === '*' && (match = value.match(/^([^']*)'[^']*'(.*)$/))) {
        response.params[actualKey].charset = match[1] || 'iso-8859-1';
        value = match[2];
      }

      response.params[actualKey].values[nr] = value;

      // remove the old reference
      delete response.params[key];
    }
  }

  // concatenate split rfc2231 strings and convert encoded strings to mime encoded words
  );Object.keys(response.params).forEach(function (key) {
    var value;
    if (response.params[key] && Array.isArray(response.params[key].values)) {
      value = response.params[key].values.map(function (val) {
        return val || '';
      }).join('');

      if (response.params[key].charset) {
        // convert "%AB" to "=?charset?Q?=AB?="
        response.params[key] = '=?' + response.params[key].charset + '?Q?' + value.replace(/[=?_\s]/g, function (s) {
          // fix invalidly encoded chars
          var c = s.charCodeAt(0).toString(16);
          return s === ' ' ? '_' : '%' + (c.length < 2 ? '0' : '') + c;
        }).replace(/%/g, '=') + '?='; // change from urlencoding to percent encoding
      } else {
        response.params[key] = value;
      }
    }
  });

  return response;
}

/**
 * Encodes a string or an Uint8Array to an UTF-8 Parameter Value Continuation encoding (rfc2231)
 * Useful for splitting long parameter values.
 *
 * For example
 *      title="unicode string"
 * becomes
 *     title*0*="utf-8''unicode"
 *     title*1*="%20string"
 *
 * @param {String|Uint8Array} data String to be encoded
 * @param {Number} [maxLength=50] Max length for generated chunks
 * @param {String} [fromCharset='UTF-8'] Source sharacter set
 * @return {Array} A list of encoded keys and headers
 */
function continuationEncode(key, data, maxLength, fromCharset) {
  var list = [];
  var encodedStr = typeof data === 'string' ? data : (0, _charset.decode)(data, fromCharset);
  var line;

  maxLength = maxLength || 50;

  // process ascii only text
  if (/^[\w.\- ]*$/.test(data)) {
    // check if conversion is even needed
    if (encodedStr.length <= maxLength) {
      return [{
        key: key,
        value: /[\s";=]/.test(encodedStr) ? '"' + encodedStr + '"' : encodedStr
      }];
    }

    encodedStr = encodedStr.replace(new RegExp('.{' + maxLength + '}', 'g'), function (str) {
      list.push({
        line: str
      });
      return '';
    });

    if (encodedStr) {
      list.push({
        line: encodedStr
      });
    }
  } else {
    // process text with unicode or special chars
    var uriEncoded = encodeURIComponent('utf-8\'\'' + encodedStr);
    var i = 0;
    while (true) {
      var len = maxLength;
      // must not split hex encoded byte between lines
      if (uriEncoded[i + maxLength - 1] === '%') {
        len -= 1;
      } else if (uriEncoded[i + maxLength - 2] === '%') {
        len -= 2;
      }
      line = uriEncoded.substr(i, len);
      if (!line) {
        break;
      }
      list.push({
        line: line,
        encoded: true
      });
      i += line.length;
    }
  }

  return list.map(function (item, i) {
    return {
      // encoded lines: {name}*{part}*
      // unencoded lines: {name}*{part}
      // if any line needs to be encoded then the first line (part==0) is always encoded
      key: key + '*' + i + (item.encoded ? '*' : ''),
      value: /[\s";=]/.test(item.line) ? '"' + item.line + '"' : item.line
    };
  });
}

/**
 * Splits a mime encoded string. Needed for dividing mime words into smaller chunks
 *
 * @param {String} str Mime encoded string to be split up
 * @param {Number} maxlen Maximum length of characters for one part (minimum 12)
 * @return {Array} Split string
 */
function _splitMimeEncodedString(str) {
  var maxlen = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 12;

  var minWordLength = 12; // require at least 12 symbols to fit possible 4 octet UTF-8 sequences
  var maxWordLength = Math.max(maxlen, minWordLength);
  var lines = [];

  while (str.length) {
    var curLine = str.substr(0, maxWordLength);

    var match = curLine.match(/=[0-9A-F]?$/i // skip incomplete escaped char
    );if (match) {
      curLine = curLine.substr(0, match.index);
    }

    var done = false;
    while (!done) {
      var chr = void 0;
      done = true;
      var _match = str.substr(curLine.length).match(/^=([0-9A-F]{2})/i // check if not middle of a unicode char sequence
      );if (_match) {
        chr = parseInt(_match[1], 16
        // invalid sequence, move one char back anc recheck
        );if (chr < 0xC2 && chr > 0x7F) {
          curLine = curLine.substr(0, curLine.length - 3);
          done = false;
        }
      }
    }

    if (curLine.length) {
      lines.push(curLine);
    }
    str = str.substr(curLine.length);
  }

  return lines;
}

function _addBase64SoftLinebreaks() {
  var base64EncodedStr = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';

  return base64EncodedStr.trim().replace(new RegExp('.{' + MAX_LINE_LENGTH + '}', 'g'), '$&\r\n').trim();
}

/**
 * Adds soft line breaks(the ones that will be stripped out when decoding QP)
 *
 * @param {String} qpEncodedStr String in Quoted-Printable encoding
 * @return {String} String with forced line breaks
 */
function _addQPSoftLinebreaks() {
  var qpEncodedStr = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';

  var pos = 0;
  var len = qpEncodedStr.length;
  var lineMargin = Math.floor(MAX_LINE_LENGTH / 3);
  var result = '';
  var match = void 0,
      line = void 0;

  // insert soft linebreaks where needed
  while (pos < len) {
    line = qpEncodedStr.substr(pos, MAX_LINE_LENGTH);
    if (match = line.match(/\r\n/)) {
      line = line.substr(0, match.index + match[0].length);
      result += line;
      pos += line.length;
      continue;
    }

    if (line.substr(-1) === '\n') {
      // nothing to change here
      result += line;
      pos += line.length;
      continue;
    } else if (match = line.substr(-lineMargin).match(/\n.*?$/)) {
      // truncate to nearest line break
      line = line.substr(0, line.length - (match[0].length - 1));
      result += line;
      pos += line.length;
      continue;
    } else if (line.length > MAX_LINE_LENGTH - lineMargin && (match = line.substr(-lineMargin).match(/[ \t.,!?][^ \t.,!?]*$/))) {
      // truncate to nearest space
      line = line.substr(0, line.length - (match[0].length - 1));
    } else if (line.substr(-1) === '\r') {
      line = line.substr(0, line.length - 1);
    } else {
      if (line.match(/=[\da-f]{0,2}$/i)) {
        // push incomplete encoding sequences to the next line
        if (match = line.match(/=[\da-f]{0,1}$/i)) {
          line = line.substr(0, line.length - match[0].length);
        }

        // ensure that utf-8 sequences are not split
        while (line.length > 3 && line.length < len - pos && !line.match(/^(?:=[\da-f]{2}){1,4}$/i) && (match = line.match(/=[\da-f]{2}$/ig))) {
          var code = parseInt(match[0].substr(1, 2), 16);
          if (code < 128) {
            break;
          }

          line = line.substr(0, line.length - 3);

          if (code >= 0xC0) {
            break;
          }
        }
      }
    }

    if (pos + line.length < len && line.substr(-1) !== '\n') {
      if (line.length === MAX_LINE_LENGTH && line.match(/=[\da-f]{2}$/i)) {
        line = line.substr(0, line.length - 3);
      } else if (line.length === MAX_LINE_LENGTH) {
        line = line.substr(0, line.length - 1);
      }
      pos += line.length;
      line += '=\r\n';
    } else {
      pos += line.length;
    }

    result += line;
  }

  return result;
}

exports.decode = _charset.decode;
exports.encode = _charset.encode;
exports.convert = _charset.convert;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9taW1lY29kZWMuanMiXSwibmFtZXMiOlsibWltZUVuY29kZSIsIm1pbWVEZWNvZGUiLCJiYXNlNjRFbmNvZGUiLCJiYXNlNjREZWNvZGUiLCJxdW90ZWRQcmludGFibGVFbmNvZGUiLCJxdW90ZWRQcmludGFibGVEZWNvZGUiLCJtaW1lV29yZEVuY29kZSIsIm1pbWVXb3Jkc0VuY29kZSIsIm1pbWVXb3JkRGVjb2RlIiwibWltZVdvcmRzRGVjb2RlIiwiZm9sZExpbmVzIiwiaGVhZGVyTGluZUVuY29kZSIsImhlYWRlckxpbmVEZWNvZGUiLCJoZWFkZXJMaW5lc0RlY29kZSIsInBhcnNlSGVhZGVyVmFsdWUiLCJjb250aW51YXRpb25FbmNvZGUiLCJNQVhfTElORV9MRU5HVEgiLCJNQVhfTUlNRV9XT1JEX0xFTkdUSCIsIk1BWF9CNjRfTUlNRV9XT1JEX0JZVEVfTEVOR1RIIiwiZGF0YSIsImZyb21DaGFyc2V0IiwiYnVmZmVyIiwicmVkdWNlIiwiYWdncmVnYXRlIiwib3JkIiwiaW5kZXgiLCJfY2hlY2tSYW5nZXMiLCJsZW5ndGgiLCJTdHJpbmciLCJmcm9tQ2hhckNvZGUiLCJ0b1N0cmluZyIsInRvVXBwZXJDYXNlIiwibnIiLCJyYW5nZXMiLCJ2YWwiLCJyYW5nZSIsInN0ciIsImVuY29kZWRCeXRlc0NvdW50IiwibWF0Y2giLCJVaW50OEFycmF5IiwiaSIsImxlbiIsImJ1ZmZlclBvcyIsImhleCIsInN1YnN0ciIsImNociIsImNoYXJBdCIsInRlc3QiLCJwYXJzZUludCIsImNoYXJDb2RlQXQiLCJidWYiLCJiNjQiLCJfYWRkQmFzZTY0U29mdExpbmVicmVha3MiLCJPVVRQVVRfVFlQRURfQVJSQVkiLCJtaW1lRW5jb2RlZFN0ciIsInJlcGxhY2UiLCJzcGFjZXMiLCJfYWRkUVBTb2Z0TGluZWJyZWFrcyIsInJhd1N0cmluZyIsIm1pbWVXb3JkRW5jb2RpbmciLCJwYXJ0cyIsImVuY29kZWRTdHIiLCJxRW5jb2RlRm9yYmlkZGVuSGVhZGVyQ2hhcnMiLCJfc3BsaXRNaW1lRW5jb2RlZFN0cmluZyIsImoiLCJzdWJzdHJpbmciLCJwdXNoIiwibWFwIiwiZW5jb2RlIiwiZW5jb2RlQmFzZTY0IiwicHJlZml4Iiwic3VmZml4IiwicCIsImpvaW4iLCJ0cmltIiwicUVuY29kZSIsInJlZ2V4Iiwic3BsaXQiLCJzaGlmdCIsImVuY29kaW5nIiwicHJldkVuY29kaW5nIiwiZW5kT2ZQcmV2V29yZCIsInJlc3VsdCIsIm1pbWVXb3JkIiwiYWZ0ZXJTcGFjZSIsInBvcyIsImxpbmUiLCJrZXkiLCJ2YWx1ZSIsImVuY29kZWRWYWx1ZSIsImhlYWRlckxpbmUiLCJoZWFkZXJzIiwibGluZXMiLCJoZWFkZXJzT2JqIiwic3BsaWNlIiwiaGVhZGVyIiwidG9Mb3dlckNhc2UiLCJjb25jYXQiLCJyZXNwb25zZSIsInBhcmFtcyIsInR5cGUiLCJxdW90ZSIsImVzY2FwZWQiLCJPYmplY3QiLCJrZXlzIiwiZm9yRWFjaCIsImFjdHVhbEtleSIsIk51bWJlciIsImNoYXJzZXQiLCJ2YWx1ZXMiLCJBcnJheSIsImlzQXJyYXkiLCJzIiwiYyIsIm1heExlbmd0aCIsImxpc3QiLCJSZWdFeHAiLCJ1cmlFbmNvZGVkIiwiZW5jb2RlVVJJQ29tcG9uZW50IiwiZW5jb2RlZCIsIml0ZW0iLCJtYXhsZW4iLCJtaW5Xb3JkTGVuZ3RoIiwibWF4V29yZExlbmd0aCIsIk1hdGgiLCJtYXgiLCJjdXJMaW5lIiwiZG9uZSIsImJhc2U2NEVuY29kZWRTdHIiLCJxcEVuY29kZWRTdHIiLCJsaW5lTWFyZ2luIiwiZmxvb3IiLCJjb2RlIiwiZGVjb2RlIiwiY29udmVydCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O1FBbUJnQkEsVSxHQUFBQSxVO1FBMEJBQyxVLEdBQUFBLFU7UUEwQkFDLFksR0FBQUEsWTtRQWFBQyxZLEdBQUFBLFk7UUFjQUMscUIsR0FBQUEscUI7UUFnQkFDLHFCLEdBQUFBLHFCO1FBaUJBQyxjLEdBQUFBLGM7UUFnREFDLGUsR0FBQUEsZTtRQVdBQyxjLEdB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dCB7IGVuY29kZSBhcyBlbmNvZGVCYXNlNjQsIGRlY29kZSBhcyBkZWNvZGVCYXNlNjQsIE9VVFBVVF9UWVBFRF9BUlJBWSB9IGZyb20gJ2VtYWlsanMtYmFzZTY0J1xuaW1wb3J0IHsgZW5jb2RlLCBkZWNvZGUsIGNvbnZlcnQsIGFycjJzdHIgfSBmcm9tICcuL2NoYXJzZXQnXG5pbXBvcnQgeyBwaXBlIH0gZnJvbSAncmFtZGEnXG5cbi8vIExpbmVzIGNhbid0IGJlIGxvbmdlciB0aGFuIDc2ICsgPENSPjxMRj4gPSA3OCBieXRlc1xuLy8gaHR0cDovL3Rvb2xzLmlldGYub3JnL2h0bWwvcmZjMjA0NSNzZWN0aW9uLTYuN1xuY29uc3QgTUFYX0xJTkVfTEVOR1RIID0gNzZcbmNvbnN0IE1BWF9NSU1FX1dPUkRfTEVOR1RIID0gNTJcbmNvbnN0IE1BWF9CNjRfTUlNRV9XT1JEX0JZVEVfTEVOR1RIID0gMzlcblxuLyoqXG4gKiBFbmNvZGVzIGFsbCBub24gcHJpbnRhYmxlIGFuZCBub24gYXNjaWkgYnl0ZXMgdG8gPVhYIGZvcm0sIHdoZXJlIFhYIGlzIHRoZVxuICogYnl0ZSB2YWx1ZSBpbiBoZXguIFRoaXMgZnVuY3Rpb24gZG9lcyBub3QgY29udmVydCBsaW5lYnJlYWtzIGV0Yy4gaXRcbiAqIG9ubHkgZXNjYXBlcyBjaGFyYWN0ZXIgc2VxdWVuY2VzXG4gKlxuICogQHBhcmFtIHtTdHJpbmd8VWludDhBcnJheX0gZGF0YSBFaXRoZXIgYSBzdHJpbmcgb3IgYW4gVWludDhBcnJheVxuICogQHBhcmFtIHtTdHJpbmd9IFtmcm9tQ2hhcnNldD0nVVRGLTgnXSBTb3VyY2UgZW5jb2RpbmdcbiAqIEByZXR1cm4ge1N0cmluZ30gTWltZSBlbmNvZGVkIHN0cmluZ1xuICovXG5leHBvcnQgZnVuY3Rpb24gbWltZUVuY29kZSAoZGF0YSA9ICcnLCBmcm9tQ2hhcnNldCA9ICdVVEYtOCcpIHtcbiAgY29uc3QgYnVmZmVyID0gY29udmVydChkYXRhLCBmcm9tQ2hhcnNldClcbiAgcmV0dXJuIGJ1ZmZlci5yZWR1Y2UoKGFnZ3JlZ2F0ZSwgb3JkLCBpbmRleCkgPT5cbiAgICBfY2hlY2tSYW5nZXMob3JkKSAmJiAhKChvcmQgPT09IDB4MjAgfHwgb3JkID09PSAweDA5KSAmJiAoaW5kZXggPT09IGJ1ZmZlci5sZW5ndGggLSAxIHx8IGJ1ZmZlcltpbmRleCArIDFdID09PSAweDBhIHx8IGJ1ZmZlcltpbmRleCArIDFdID09PSAweDBkKSlcbiAgICAgID8gYWdncmVnYXRlICsgU3RyaW5nLmZyb21DaGFyQ29kZShvcmQpIC8vIGlmIHRoZSBjaGFyIGlzIGluIGFsbG93ZWQgcmFuZ2UsIHRoZW4ga2VlcCBhcyBpcywgdW5sZXNzIGl0IGlzIGEgd3MgaW4gdGhlIGVuZCBvZiBhIGxpbmVcbiAgICAgIDogYWdncmVnYXRlICsgJz0nICsgKG9yZCA8IDB4MTAgPyAnMCcgOiAnJykgKyBvcmQudG9TdHJpbmcoMTYpLnRvVXBwZXJDYXNlKCksICcnKVxuXG4gIGZ1bmN0aW9uIF9jaGVja1JhbmdlcyAobnIpIHtcbiAgICBjb25zdCByYW5nZXMgPSBbIC8vIGh0dHBzOi8vdG9vbHMuaWV0Zi5vcmcvaHRtbC9yZmMyMDQ1I3NlY3Rpb24tNi43XG4gICAgICBbMHgwOV0sIC8vIDxUQUI+XG4gICAgICBbMHgwQV0sIC8vIDxMRj5cbiAgICAgIFsweDBEXSwgLy8gPENSPlxuICAgICAgWzB4MjAsIDB4M0NdLCAvLyA8U1A+IVwiIyQlJicoKSorLC0uLzAxMjM0NTY3ODk6O1xuICAgICAgWzB4M0UsIDB4N0VdIC8vID4/QEFCQ0RFRkdISUpLTE1OT1BRUlNUVVZXWFlaW1xcXV5fYGFiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6e3x9XG4gICAgXVxuICAgIHJldHVybiByYW5nZXMucmVkdWNlKCh2YWwsIHJhbmdlKSA9PiB2YWwgfHwgKHJhbmdlLmxlbmd0aCA9PT0gMSAmJiBuciA9PT0gcmFuZ2VbMF0pIHx8IChyYW5nZS5sZW5ndGggPT09IDIgJiYgbnIgPj0gcmFuZ2VbMF0gJiYgbnIgPD0gcmFuZ2VbMV0pLCBmYWxzZSlcbiAgfVxufVxuXG4vKipcbiAqIERlY29kZXMgbWltZSBlbmNvZGVkIHN0cmluZyB0byBhbiB1bmljb2RlIHN0cmluZ1xuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBzdHIgTWltZSBlbmNvZGVkIHN0cmluZ1xuICogQHBhcmFtIHtTdHJpbmd9IFtmcm9tQ2hhcnNldD0nVVRGLTgnXSBTb3VyY2UgZW5jb2RpbmdcbiAqIEByZXR1cm4ge1N0cmluZ30gRGVjb2RlZCB1bmljb2RlIHN0cmluZ1xuICovXG5leHBvcnQgZnVuY3Rpb24gbWltZURlY29kZSAoc3RyID0gJycsIGZyb21DaGFyc2V0ID0gJ1VURi04Jykge1xuICBjb25zdCBlbmNvZGVkQnl0ZXNDb3VudCA9IChzdHIubWF0Y2goLz1bXFxkYS1mQS1GXXsyfS9nKSB8fCBbXSkubGVuZ3RoXG4gIGxldCBidWZmZXIgPSBuZXcgVWludDhBcnJheShzdHIubGVuZ3RoIC0gZW5jb2RlZEJ5dGVzQ291bnQgKiAyKVxuXG4gIGZvciAodmFyIGkgPSAwLCBsZW4gPSBzdHIubGVuZ3RoLCBidWZmZXJQb3MgPSAwOyBpIDwgbGVuOyBpKyspIHtcbiAgICBsZXQgaGV4ID0gc3RyLnN1YnN0cihpICsgMSwgMilcbiAgICBjb25zdCBjaHIgPSBzdHIuY2hhckF0KGkpXG4gICAgaWYgKGNociA9PT0gJz0nICYmIGhleCAmJiAvW1xcZGEtZkEtRl17Mn0vLnRlc3QoaGV4KSkge1xuICAgICAgYnVmZmVyW2J1ZmZlclBvcysrXSA9IHBhcnNlSW50KGhleCwgMTYpXG4gICAgICBpICs9IDJcbiAgICB9IGVsc2Uge1xuICAgICAgYnVmZmVyW2J1ZmZlclBvcysrXSA9IGNoci5jaGFyQ29kZUF0KDApXG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGRlY29kZShidWZmZXIsIGZyb21DaGFyc2V0KVxufVxuXG4vKipcbiAqIEVuY29kZXMgYSBzdHJpbmcgb3IgYW4gdHlwZWQgYXJyYXkgb2YgZ2l2ZW4gY2hhcnNldCBpbnRvIHVuaWNvZGVcbiAqIGJhc2U2NCBzdHJpbmcuIEFsc28gYWRkcyBsaW5lIGJyZWFrc1xuICpcbiAqIEBwYXJhbSB7U3RyaW5nfFVpbnQ4QXJyYXl9IGRhdGEgU3RyaW5nIG9yIHR5cGVkIGFycmF5IHRvIGJlIGJhc2U2NCBlbmNvZGVkXG4gKiBAcGFyYW0ge1N0cmluZ30gSW5pdGlhbCBjaGFyc2V0LCBlLmcuICdiaW5hcnknLiBEZWZhdWx0cyB0byAnVVRGLTgnXG4gKiBAcmV0dXJuIHtTdHJpbmd9IEJhc2U2NCBlbmNvZGVkIHN0cmluZ1xuICovXG5leHBvcnQgZnVuY3Rpb24gYmFzZTY0RW5jb2RlIChkYXRhLCBmcm9tQ2hhcnNldCA9ICdVVEYtOCcpIHtcbiAgY29uc3QgYnVmID0gKHR5cGVvZiBkYXRhICE9PSAnc3RyaW5nJyAmJiBmcm9tQ2hhcnNldCA9PT0gJ2JpbmFyeScpID8gZGF0YSA6IGNvbnZlcnQoZGF0YSwgZnJvbUNoYXJzZXQpXG4gIGNvbnN0IGI2NCA9IGVuY29kZUJhc2U2NChidWYpXG4gIHJldHVybiBfYWRkQmFzZTY0U29mdExpbmVicmVha3MoYjY0KVxufVxuXG4vKipcbiAqIERlY29kZXMgYSBiYXNlNjQgc3RyaW5nIG9mIGFueSBjaGFyc2V0IGludG8gYW4gdW5pY29kZSBzdHJpbmdcbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gc3RyIEJhc2U2NCBlbmNvZGVkIHN0cmluZ1xuICogQHBhcmFtIHtTdHJpbmd9IFtmcm9tQ2hhcnNldD0nVVRGLTgnXSBPcmlnaW5hbCBjaGFyc2V0IG9mIHRoZSBiYXNlNjQgZW5jb2RlZCBzdHJpbmdcbiAqIEByZXR1cm4ge1N0cmluZ30gRGVjb2RlZCB1bmljb2RlIHN0cmluZ1xuICovXG5leHBvcnQgZnVuY3Rpb24gYmFzZTY0RGVjb2RlIChzdHIsIGZyb21DaGFyc2V0KSB7XG4gIGNvbnN0IGJ1ZiA9IGRlY29kZUJhc2U2NChzdHIsIE9VVFBVVF9UWVBFRF9BUlJBWSlcbiAgcmV0dXJuIGZyb21DaGFyc2V0ID09PSAnYmluYXJ5JyA/IGFycjJzdHIoYnVmKSA6IGRlY29kZShidWYsIGZyb21DaGFyc2V0KVxufVxuXG4vKipcbiAqIEVuY29kZXMgYSBzdHJpbmcgb3IgYW4gVWludDhBcnJheSBpbnRvIGEgcXVvdGVkIHByaW50YWJsZSBlbmNvZGluZ1xuICogVGhpcyBpcyBhbG1vc3QgdGhlIHNhbWUgYXMgbWltZUVuY29kZSwgZXhjZXB0IGxpbmUgYnJlYWtzIHdpbGwgYmUgY2hhbmdlZFxuICogYXMgd2VsbCB0byBlbnN1cmUgdGhhdCB0aGUgbGluZXMgYXJlIG5ldmVyIGxvbmdlciB0aGFuIGFsbG93ZWQgbGVuZ3RoXG4gKlxuICogQHBhcmFtIHtTdHJpbmd8VWludDhBcnJheX0gZGF0YSBTdHJpbmcgb3IgYW4gVWludDhBcnJheSB0byBtaW1lIGVuY29kZVxuICogQHBhcmFtIHtTdHJpbmd9IFtmcm9tQ2hhcnNldD0nVVRGLTgnXSBPcmlnaW5hbCBjaGFyc2V0IG9mIHRoZSBzdHJpbmdcbiAqIEByZXR1cm4ge1N0cmluZ30gTWltZSBlbmNvZGVkIHN0cmluZ1xuICovXG5leHBvcnQgZnVuY3Rpb24gcXVvdGVkUHJpbnRhYmxlRW5jb2RlIChkYXRhID0gJycsIGZyb21DaGFyc2V0ID0gJ1VURi04Jykge1xuICBjb25zdCBtaW1lRW5jb2RlZFN0ciA9IG1pbWVFbmNvZGUoZGF0YSwgZnJvbUNoYXJzZXQpXG4gICAgLnJlcGxhY2UoL1xccj9cXG58XFxyL2csICdcXHJcXG4nKSAvLyBmaXggbGluZSBicmVha3MsIGVuc3VyZSA8Q1I+PExGPlxuICAgIC5yZXBsYWNlKC9bXFx0IF0rJC9nbSwgc3BhY2VzID0+IHNwYWNlcy5yZXBsYWNlKC8gL2csICc9MjAnKS5yZXBsYWNlKC9cXHQvZywgJz0wOScpKSAvLyByZXBsYWNlIHNwYWNlcyBpbiB0aGUgZW5kIG9mIGxpbmVzXG5cbiAgcmV0dXJuIF9hZGRRUFNvZnRMaW5lYnJlYWtzKG1pbWVFbmNvZGVkU3RyKSAvLyBhZGQgc29mdCBsaW5lIGJyZWFrcyB0byBlbnN1cmUgbGluZSBsZW5ndGhzIHNqb3J0ZXIgdGhhbiA3NiBieXRlc1xufVxuXG4vKipcbiAqIERlY29kZXMgYSBzdHJpbmcgZnJvbSBhIHF1b3RlZCBwcmludGFibGUgZW5jb2RpbmcuIFRoaXMgaXMgYWxtb3N0IHRoZVxuICogc2FtZSBhcyBtaW1lRGVjb2RlLCBleGNlcHQgbGluZSBicmVha3Mgd2lsbCBiZSBjaGFuZ2VkIGFzIHdlbGxcbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gc3RyIE1pbWUgZW5jb2RlZCBzdHJpbmcgdG8gZGVjb2RlXG4gKiBAcGFyYW0ge1N0cmluZ30gW2Zyb21DaGFyc2V0PSdVVEYtOCddIE9yaWdpbmFsIGNoYXJzZXQgb2YgdGhlIHN0cmluZ1xuICogQHJldHVybiB7U3RyaW5nfSBNaW1lIGRlY29kZWQgc3RyaW5nXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBxdW90ZWRQcmludGFibGVEZWNvZGUgKHN0ciA9ICcnLCBmcm9tQ2hhcnNldCA9ICdVVEYtOCcpIHtcbiAgY29uc3QgcmF3U3RyaW5nID0gc3RyXG4gICAgLnJlcGxhY2UoL1tcXHQgXSskL2dtLCAnJykgLy8gcmVtb3ZlIGludmFsaWQgd2hpdGVzcGFjZSBmcm9tIHRoZSBlbmQgb2YgbGluZXNcbiAgICAucmVwbGFjZSgvPSg/Olxccj9cXG58JCkvZywgJycpIC8vIHJlbW92ZSBzb2Z0IGxpbmUgYnJlYWtzXG5cbiAgcmV0dXJuIG1pbWVEZWNvZGUocmF3U3RyaW5nLCBmcm9tQ2hhcnNldClcbn1cblxuLyoqXG4gKiBFbmNvZGVzIGEgc3RyaW5nIG9yIGFuIFVpbnQ4QXJyYXkgdG8gYW4gVVRGLTggTUlNRSBXb3JkXG4gKiAgIGh0dHBzOi8vdG9vbHMuaWV0Zi5vcmcvaHRtbC9yZmMyMDQ3XG4gKlxuICogQHBhcmFtIHtTdHJpbmd8VWludDhBcnJheX0gZGF0YSBTdHJpbmcgdG8gYmUgZW5jb2RlZFxuICogQHBhcmFtIHtTdHJpbmd9IG1pbWVXb3JkRW5jb2Rpbmc9J1EnIEVuY29kaW5nIGZvciB0aGUgbWltZSB3b3JkLCBlaXRoZXIgUSBvciBCXG4gKiBAcGFyYW0ge1N0cmluZ30gW2Zyb21DaGFyc2V0PSdVVEYtOCddIFNvdXJjZSBzaGFyYWN0ZXIgc2V0XG4gKiBAcmV0dXJuIHtTdHJpbmd9IFNpbmdsZSBvciBzZXZlcmFsIG1pbWUgd29yZHMgam9pbmVkIHRvZ2V0aGVyXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBtaW1lV29yZEVuY29kZSAoZGF0YSwgbWltZVdvcmRFbmNvZGluZyA9ICdRJywgZnJvbUNoYXJzZXQgPSAnVVRGLTgnKSB7XG4gIGxldCBwYXJ0cyA9IFtdXG4gIGNvbnN0IHN0ciA9ICh0eXBlb2YgZGF0YSA9PT0gJ3N0cmluZycpID8gZGF0YSA6IGRlY29kZShkYXRhLCBmcm9tQ2hhcnNldClcblxuICBpZiAobWltZVdvcmRFbmNvZGluZyA9PT0gJ1EnKSB7XG4gICAgY29uc3Qgc3RyID0gKHR5cGVvZiBkYXRhID09PSAnc3RyaW5nJykgPyBkYXRhIDogZGVjb2RlKGRhdGEsIGZyb21DaGFyc2V0KVxuICAgIGxldCBlbmNvZGVkU3RyID0gcGlwZShtaW1lRW5jb2RlLCBxRW5jb2RlRm9yYmlkZGVuSGVhZGVyQ2hhcnMpKHN0cilcbiAgICBwYXJ0cyA9IGVuY29kZWRTdHIubGVuZ3RoIDwgTUFYX01JTUVfV09SRF9MRU5HVEggPyBbZW5jb2RlZFN0cl0gOiBfc3BsaXRNaW1lRW5jb2RlZFN0cmluZyhlbmNvZGVkU3RyLCBNQVhfTUlNRV9XT1JEX0xFTkdUSClcbiAgfSBlbHNlIHtcbiAgICAvLyBGaXRzIGFzIG11Y2ggYXMgcG9zc2libGUgaW50byBldmVyeSBsaW5lIHdpdGhvdXQgYnJlYWtpbmcgdXRmLTggbXVsdGlieXRlIGNoYXJhY3RlcnMnIG9jdGV0cyB1cCBhY3Jvc3MgbGluZXNcbiAgICBsZXQgaiA9IDBcbiAgICBsZXQgaSA9IDBcbiAgICB3aGlsZSAoaSA8IHN0ci5sZW5ndGgpIHtcbiAgICAgIGlmIChlbmNvZGUoc3RyLnN1YnN0cmluZyhqLCBpKSkubGVuZ3RoID4gTUFYX0I2NF9NSU1FX1dPUkRfQllURV9MRU5HVEgpIHtcbiAgICAgICAgLy8gd2Ugd2VudCBvbmUgY2hhcmFjdGVyIHRvbyBmYXIsIHN1YnN0cmluZyBhdCB0aGUgY2hhciBiZWZvcmVcbiAgICAgICAgcGFydHMucHVzaChzdHIuc3Vic3RyaW5nKGosIGkgLSAxKSlcbiAgICAgICAgaiA9IGkgLSAxXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpKytcbiAgICAgIH1cbiAgICB9XG4gICAgLy8gYWRkIHRoZSByZW1haW5kZXIgb2YgdGhlIHN0cmluZ1xuICAgIHN0ci5zdWJzdHJpbmcoaikgJiYgcGFydHMucHVzaChzdHIuc3Vic3RyaW5nKGopKVxuICAgIHBhcnRzID0gcGFydHMubWFwKGVuY29kZSkubWFwKGVuY29kZUJhc2U2NClcbiAgfVxuXG4gIGNvbnN0IHByZWZpeCA9ICc9P1VURi04PycgKyBtaW1lV29yZEVuY29kaW5nICsgJz8nXG4gIGNvbnN0IHN1ZmZpeCA9ICc/PSAnXG4gIHJldHVybiBwYXJ0cy5tYXAocCA9PiBwcmVmaXggKyBwICsgc3VmZml4KS5qb2luKCcnKS50cmltKClcbn1cblxuLyoqXG4gKiBRLUVuY29kZXMgcmVtYWluaW5nIGZvcmJpZGRlbiBoZWFkZXIgY2hhcnNcbiAqICAgaHR0cHM6Ly90b29scy5pZXRmLm9yZy9odG1sL3JmYzIwNDcjc2VjdGlvbi01XG4gKi9cbmNvbnN0IHFFbmNvZGVGb3JiaWRkZW5IZWFkZXJDaGFycyA9IGZ1bmN0aW9uIChzdHIpIHtcbiAgY29uc3QgcUVuY29kZSA9IGNociA9PiBjaHIgPT09ICcgJyA/ICdfJyA6ICgnPScgKyAoY2hyLmNoYXJDb2RlQXQoMCkgPCAweDEwID8gJzAnIDogJycpICsgY2hyLmNoYXJDb2RlQXQoMCkudG9TdHJpbmcoMTYpLnRvVXBwZXJDYXNlKCkpXG4gIHJldHVybiBzdHIucmVwbGFjZSgvW15hLXowLTkhKitcXC0vPV0vaWcsIHFFbmNvZGUpXG59XG5cbi8qKlxuICogRmluZHMgd29yZCBzZXF1ZW5jZXMgd2l0aCBub24gYXNjaWkgdGV4dCBhbmQgY29udmVydHMgdGhlc2UgdG8gbWltZSB3b3Jkc1xuICpcbiAqIEBwYXJhbSB7U3RyaW5nfFVpbnQ4QXJyYXl9IGRhdGEgU3RyaW5nIHRvIGJlIGVuY29kZWRcbiAqIEBwYXJhbSB7U3RyaW5nfSBtaW1lV29yZEVuY29kaW5nPSdRJyBFbmNvZGluZyBmb3IgdGhlIG1pbWUgd29yZCwgZWl0aGVyIFEgb3IgQlxuICogQHBhcmFtIHtTdHJpbmd9IFtmcm9tQ2hhcnNldD0nVVRGLTgnXSBTb3VyY2Ugc2hhcmFjdGVyIHNldFxuICogQHJldHVybiB7U3RyaW5nfSBTdHJpbmcgd2l0aCBwb3NzaWJsZSBtaW1lIHdvcmRzXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBtaW1lV29yZHNFbmNvZGUgKGRhdGEgPSAnJywgbWltZVdvcmRFbmNvZGluZyA9ICdRJywgZnJvbUNoYXJzZXQgPSAnVVRGLTgnKSB7XG4gIGNvbnN0IHJlZ2V4ID0gLyhbXlxcc1xcdTAwODAtXFx1RkZGRl0qW1xcdTAwODAtXFx1RkZGRl0rW15cXHNcXHUwMDgwLVxcdUZGRkZdKig/OlxccytbXlxcc1xcdTAwODAtXFx1RkZGRl0qW1xcdTAwODAtXFx1RkZGRl0rW15cXHNcXHUwMDgwLVxcdUZGRkZdKlxccyopPykrKD89XFxzfCQpL2dcbiAgcmV0dXJuIGRlY29kZShjb252ZXJ0KGRhdGEsIGZyb21DaGFyc2V0KSkucmVwbGFjZShyZWdleCwgbWF0Y2ggPT4gbWF0Y2gubGVuZ3RoID8gbWltZVdvcmRFbmNvZGUobWF0Y2gsIG1pbWVXb3JkRW5jb2RpbmcsIGZyb21DaGFyc2V0KSA6ICcnKVxufVxuXG4vKipcbiAqIERlY29kZSBhIGNvbXBsZXRlIG1pbWUgd29yZCBlbmNvZGVkIHN0cmluZ1xuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBzdHIgTWltZSB3b3JkIGVuY29kZWQgc3RyaW5nXG4gKiBAcmV0dXJuIHtTdHJpbmd9IERlY29kZWQgdW5pY29kZSBzdHJpbmdcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG1pbWVXb3JkRGVjb2RlIChzdHIgPSAnJykge1xuICBjb25zdCBtYXRjaCA9IHN0ci5tYXRjaCgvXj1cXD8oW1xcd19cXC0qXSspXFw/KFtRcUJiXSlcXD8oW14/XSopXFw/PSQvaSlcbiAgaWYgKCFtYXRjaCkgcmV0dXJuIHN0clxuXG4gIC8vIFJGQzIyMzEgYWRkZWQgbGFuZ3VhZ2UgdGFnIHRvIHRoZSBlbmNvZGluZ1xuICAvLyBzZWU6IGh0dHBzOi8vdG9vbHMuaWV0Zi5vcmcvaHRtbC9yZmMyMjMxI3NlY3Rpb24tNVxuICAvLyB0aGlzIGltcGxlbWVudGF0aW9uIHNpbGVudGx5IGlnbm9yZXMgdGhpcyB0YWdcbiAgY29uc3QgZnJvbUNoYXJzZXQgPSBtYXRjaFsxXS5zcGxpdCgnKicpLnNoaWZ0KClcbiAgY29uc3QgZW5jb2RpbmcgPSAobWF0Y2hbMl0gfHwgJ1EnKS50b1N0cmluZygpLnRvVXBwZXJDYXNlKClcbiAgY29uc3QgcmF3U3RyaW5nID0gKG1hdGNoWzNdIHx8ICcnKS5yZXBsYWNlKC9fL2csICcgJylcblxuICBpZiAoZW5jb2RpbmcgPT09ICdCJykge1xuICAgIHJldHVybiBiYXNlNjREZWNvZGUocmF3U3RyaW5nLCBmcm9tQ2hhcnNldClcbiAgfSBlbHNlIGlmIChlbmNvZGluZyA9PT0gJ1EnKSB7XG4gICAgcmV0dXJuIG1pbWVEZWNvZGUocmF3U3RyaW5nLCBmcm9tQ2hhcnNldClcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gc3RyXG4gIH1cbn1cblxuLyoqXG4gKiBEZWNvZGUgYSBzdHJpbmcgdGhhdCBtaWdodCBpbmNsdWRlIG9uZSBvciBzZXZlcmFsIG1pbWUgd29yZHNcbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gc3RyIFN0cmluZyBpbmNsdWRpbmcgc29tZSBtaW1lIHdvcmRzIHRoYXQgd2lsbCBiZSBlbmNvZGVkXG4gKiBAcmV0dXJuIHtTdHJpbmd9IERlY29kZWQgdW5pY29kZSBzdHJpbmdcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG1pbWVXb3Jkc0RlY29kZSAoc3RyID0gJycpIHtcbiAgc3RyID0gc3RyLnRvU3RyaW5nKCkucmVwbGFjZSgvKD1cXD9bXj9dK1xcP1tRcUJiXVxcP1teP10rXFw/PSlcXHMrKD89PVxcP1teP10rXFw/W1FxQmJdXFw/W14/XSpcXD89KS9nLCAnJDEnKVxuICAvLyBqb2luIGJ5dGVzIG9mIG11bHRpLWJ5dGUgVVRGLThcbiAgbGV0IHByZXZFbmNvZGluZ1xuICBzdHIgPSBzdHIucmVwbGFjZSgvKFxcPz0pPz1cXD9bdVVdW3RUXVtmRl0tOFxcPyhbUXFCYl0pXFw/L2csIChtYXRjaCwgZW5kT2ZQcmV2V29yZCwgZW5jb2RpbmcpID0+IHtcbiAgICBjb25zdCByZXN1bHQgPSAoZW5kT2ZQcmV2V29yZCAmJiBlbmNvZGluZyA9PT0gcHJldkVuY29kaW5nKSA/ICcnIDogbWF0Y2hcbiAgICBwcmV2RW5jb2RpbmcgPSBlbmNvZGluZ1xuICAgIHJldHVybiByZXN1bHRcbiAgfSlcbiAgc3RyID0gc3RyLnJlcGxhY2UoLz1cXD9bXFx3X1xcLSpdK1xcP1tRcUJiXVxcP1teP10qXFw/PS9nLCBtaW1lV29yZCA9PiBtaW1lV29yZERlY29kZShtaW1lV29yZC5yZXBsYWNlKC9cXHMrL2csICcnKSkpXG5cbiAgcmV0dXJuIHN0clxufVxuXG4vKipcbiAqIEZvbGRzIGxvbmcgbGluZXMsIHVzZWZ1bCBmb3IgZm9sZGluZyBoZWFkZXIgbGluZXMgKGFmdGVyU3BhY2U9ZmFsc2UpIGFuZFxuICogZmxvd2VkIHRleHQgKGFmdGVyU3BhY2U9dHJ1ZSlcbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gc3RyIFN0cmluZyB0byBiZSBmb2xkZWRcbiAqIEBwYXJhbSB7Qm9vbGVhbn0gYWZ0ZXJTcGFjZSBJZiB0cnVlLCBsZWF2ZSBhIHNwYWNlIGluIHRoIGVuZCBvZiBhIGxpbmVcbiAqIEByZXR1cm4ge1N0cmluZ30gU3RyaW5nIHdpdGggZm9sZGVkIGxpbmVzXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBmb2xkTGluZXMgKHN0ciA9ICcnLCBhZnRlclNwYWNlKSB7XG4gIGxldCBwb3MgPSAwXG4gIGNvbnN0IGxlbiA9IHN0ci5sZW5ndGhcbiAgbGV0IHJlc3VsdCA9ICcnXG4gIGxldCBsaW5lLCBtYXRjaFxuXG4gIHdoaWxlIChwb3MgPCBsZW4pIHtcbiAgICBsaW5lID0gc3RyLnN1YnN0cihwb3MsIE1BWF9MSU5FX0xFTkdUSClcbiAgICBpZiAobGluZS5sZW5ndGggPCBNQVhfTElORV9MRU5HVEgpIHtcbiAgICAgIHJlc3VsdCArPSBsaW5lXG4gICAgICBicmVha1xuICAgIH1cbiAgICBpZiAoKG1hdGNoID0gbGluZS5tYXRjaCgvXlteXFxuXFxyXSooXFxyP1xcbnxcXHIpLykpKSB7XG4gICAgICBsaW5lID0gbWF0Y2hbMF1cbiAgICAgIHJlc3VsdCArPSBsaW5lXG4gICAgICBwb3MgKz0gbGluZS5sZW5ndGhcbiAgICAgIGNvbnRpbnVlXG4gICAgfSBlbHNlIGlmICgobWF0Y2ggPSBsaW5lLm1hdGNoKC8oXFxzKylbXlxcc10qJC8pKSAmJiBtYXRjaFswXS5sZW5ndGggLSAoYWZ0ZXJTcGFjZSA/IChtYXRjaFsxXSB8fCAnJykubGVuZ3RoIDogMCkgPCBsaW5lLmxlbmd0aCkge1xuICAgICAgbGluZSA9IGxpbmUuc3Vic3RyKDAsIGxpbmUubGVuZ3RoIC0gKG1hdGNoWzBdLmxlbmd0aCAtIChhZnRlclNwYWNlID8gKG1hdGNoWzFdIHx8ICcnKS5sZW5ndGggOiAwKSkpXG4gICAgfSBlbHNlIGlmICgobWF0Y2ggPSBzdHIuc3Vic3RyKHBvcyArIGxpbmUubGVuZ3RoKS5tYXRjaCgvXlteXFxzXSsoXFxzKikvKSkpIHtcbiAgICAgIGxpbmUgPSBsaW5lICsgbWF0Y2hbMF0uc3Vic3RyKDAsIG1hdGNoWzBdLmxlbmd0aCAtICghYWZ0ZXJTcGFjZSA/IChtYXRjaFsxXSB8fCAnJykubGVuZ3RoIDogMCkpXG4gICAgfVxuXG4gICAgcmVzdWx0ICs9IGxpbmVcbiAgICBwb3MgKz0gbGluZS5sZW5ndGhcbiAgICBpZiAocG9zIDwgbGVuKSB7XG4gICAgICByZXN1bHQgKz0gJ1xcclxcbidcbiAgICB9XG4gIH1cblxuICByZXR1cm4gcmVzdWx0XG59XG5cbi8qKlxuICogRW5jb2RlcyBhbmQgZm9sZHMgYSBoZWFkZXIgbGluZSBmb3IgYSBNSU1FIG1lc3NhZ2UgaGVhZGVyLlxuICogU2hvcnRoYW5kIGZvciBtaW1lV29yZHNFbmNvZGUgKyBmb2xkTGluZXNcbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30ga2V5IEtleSBuYW1lLCB3aWxsIG5vdCBiZSBlbmNvZGVkXG4gKiBAcGFyYW0ge1N0cmluZ3xVaW50OEFycmF5fSB2YWx1ZSBWYWx1ZSB0byBiZSBlbmNvZGVkXG4gKiBAcGFyYW0ge1N0cmluZ30gW2Zyb21DaGFyc2V0PSdVVEYtOCddIENoYXJhY3RlciBzZXQgb2YgdGhlIHZhbHVlXG4gKiBAcmV0dXJuIHtTdHJpbmd9IGVuY29kZWQgYW5kIGZvbGRlZCBoZWFkZXIgbGluZVxuICovXG5leHBvcnQgZnVuY3Rpb24gaGVhZGVyTGluZUVuY29kZSAoa2V5LCB2YWx1ZSwgZnJvbUNoYXJzZXQpIHtcbiAgdmFyIGVuY29kZWRWYWx1ZSA9IG1pbWVXb3Jkc0VuY29kZSh2YWx1ZSwgJ1EnLCBmcm9tQ2hhcnNldClcbiAgcmV0dXJuIGZvbGRMaW5lcyhrZXkgKyAnOiAnICsgZW5jb2RlZFZhbHVlKVxufVxuXG4vKipcbiAqIFRoZSByZXN1bHQgaXMgbm90IG1pbWUgd29yZCBkZWNvZGVkLCB5b3UgbmVlZCB0byBkbyB5b3VyIG93biBkZWNvZGluZyBiYXNlZFxuICogb24gdGhlIHJ1bGVzIGZvciB0aGUgc3BlY2lmaWMgaGVhZGVyIGtleVxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBoZWFkZXJMaW5lIFNpbmdsZSBoZWFkZXIgbGluZSwgbWlnaHQgaW5jbHVkZSBsaW5lYnJlYWtzIGFzIHdlbGwgaWYgZm9sZGVkXG4gKiBAcmV0dXJuIHtPYmplY3R9IEFuZCBvYmplY3Qgb2Yge2tleSwgdmFsdWV9XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBoZWFkZXJMaW5lRGVjb2RlIChoZWFkZXJMaW5lID0gJycpIHtcbiAgY29uc3QgbGluZSA9IGhlYWRlckxpbmUudG9TdHJpbmcoKS5yZXBsYWNlKC8oPzpcXHI/XFxufFxccilbIFxcdF0qL2csICcgJykudHJpbSgpXG4gIGNvbnN0IG1hdGNoID0gbGluZS5tYXRjaCgvXlxccyooW146XSspOiguKikkLylcblxuICByZXR1cm4ge1xuICAgIGtleTogKChtYXRjaCAmJiBtYXRjaFsxXSkgfHwgJycpLnRyaW0oKSxcbiAgICB2YWx1ZTogKChtYXRjaCAmJiBtYXRjaFsyXSkgfHwgJycpLnRyaW0oKVxuICB9XG59XG5cbi8qKlxuICogUGFyc2VzIGEgYmxvY2sgb2YgaGVhZGVyIGxpbmVzLiBEb2VzIG5vdCBkZWNvZGUgbWltZSB3b3JkcyBhcyBldmVyeVxuICogaGVhZGVyIG1pZ2h0IGhhdmUgaXRzIG93biBydWxlcyAoZWcuIGZvcm1hdHRlZCBlbWFpbCBhZGRyZXNzZXMgYW5kIHN1Y2gpXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGhlYWRlcnMgSGVhZGVycyBzdHJpbmdcbiAqIEByZXR1cm4ge09iamVjdH0gQW4gb2JqZWN0IG9mIGhlYWRlcnMsIHdoZXJlIGhlYWRlciBrZXlzIGFyZSBvYmplY3Qga2V5cy4gTkIhIFNldmVyYWwgdmFsdWVzIHdpdGggdGhlIHNhbWUga2V5IG1ha2UgdXAgYW4gQXJyYXlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGhlYWRlckxpbmVzRGVjb2RlIChoZWFkZXJzKSB7XG4gIGNvbnN0IGxpbmVzID0gaGVhZGVycy5zcGxpdCgvXFxyP1xcbnxcXHIvKVxuICBjb25zdCBoZWFkZXJzT2JqID0ge31cblxuICBmb3IgKGxldCBpID0gbGluZXMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICBpZiAoaSAmJiBsaW5lc1tpXS5tYXRjaCgvXlxccy8pKSB7XG4gICAgICBsaW5lc1tpIC0gMV0gKz0gJ1xcclxcbicgKyBsaW5lc1tpXVxuICAgICAgbGluZXMuc3BsaWNlKGksIDEpXG4gICAgfVxuICB9XG5cbiAgZm9yIChsZXQgaSA9IDAsIGxlbiA9IGxpbmVzLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgY29uc3QgaGVhZGVyID0gaGVhZGVyTGluZURlY29kZShsaW5lc1tpXSlcbiAgICBjb25zdCBrZXkgPSBoZWFkZXIua2V5LnRvTG93ZXJDYXNlKClcbiAgICBjb25zdCB2YWx1ZSA9IGhlYWRlci52YWx1ZVxuXG4gICAgaWYgKCFoZWFkZXJzT2JqW2tleV0pIHtcbiAgICAgIGhlYWRlcnNPYmpba2V5XSA9IHZhbHVlXG4gICAgfSBlbHNlIHtcbiAgICAgIGhlYWRlcnNPYmpba2V5XSA9IFtdLmNvbmNhdChoZWFkZXJzT2JqW2tleV0sIHZhbHVlKVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBoZWFkZXJzT2JqXG59XG5cbi8qKlxuICogUGFyc2VzIGEgaGVhZGVyIHZhbHVlIHdpdGgga2V5PXZhbHVlIGFyZ3VtZW50cyBpbnRvIGEgc3RydWN0dXJlZFxuICogb2JqZWN0LlxuICpcbiAqICAgcGFyc2VIZWFkZXJWYWx1ZSgnY29udGVudC10eXBlOiB0ZXh0L3BsYWluOyBDSEFSU0VUPSdVVEYtOCcnKSAtPlxuICogICB7XG4gKiAgICAgJ3ZhbHVlJzogJ3RleHQvcGxhaW4nLFxuICogICAgICdwYXJhbXMnOiB7XG4gKiAgICAgICAnY2hhcnNldCc6ICdVVEYtOCdcbiAqICAgICB9XG4gKiAgIH1cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gc3RyIEhlYWRlciB2YWx1ZVxuICogQHJldHVybiB7T2JqZWN0fSBIZWFkZXIgdmFsdWUgYXMgYSBwYXJzZWQgc3RydWN0dXJlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZUhlYWRlclZhbHVlIChzdHIpIHtcbiAgbGV0IHJlc3BvbnNlID0ge1xuICAgIHZhbHVlOiBmYWxzZSxcbiAgICBwYXJhbXM6IHt9XG4gIH1cbiAgbGV0IGtleSA9IGZhbHNlXG4gIGxldCB2YWx1ZSA9ICcnXG4gIGxldCB0eXBlID0gJ3ZhbHVlJ1xuICBsZXQgcXVvdGUgPSBmYWxzZVxuICBsZXQgZXNjYXBlZCA9IGZhbHNlXG4gIGxldCBjaHJcblxuICBmb3IgKGxldCBpID0gMCwgbGVuID0gc3RyLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgY2hyID0gc3RyLmNoYXJBdChpKVxuICAgIGlmICh0eXBlID09PSAna2V5Jykge1xuICAgICAgaWYgKGNociA9PT0gJz0nKSB7XG4gICAgICAgIGtleSA9IHZhbHVlLnRyaW0oKS50b0xvd2VyQ2FzZSgpXG4gICAgICAgIHR5cGUgPSAndmFsdWUnXG4gICAgICAgIHZhbHVlID0gJydcbiAgICAgICAgY29udGludWVcbiAgICAgIH1cbiAgICAgIHZhbHVlICs9IGNoclxuICAgIH0gZWxzZSB7XG4gICAgICBpZiAoZXNjYXBlZCkge1xuICAgICAgICB2YWx1ZSArPSBjaHJcbiAgICAgIH0gZWxzZSBpZiAoY2hyID09PSAnXFxcXCcpIHtcbiAgICAgICAgZXNjYXBlZCA9IHRydWVcbiAgICAgICAgY29udGludWVcbiAgICAgIH0gZWxzZSBpZiAocXVvdGUgJiYgY2hyID09PSBxdW90ZSkge1xuICAgICAgICBxdW90ZSA9IGZhbHNlXG4gICAgICB9IGVsc2UgaWYgKCFxdW90ZSAmJiBjaHIgPT09ICdcIicpIHtcbiAgICAgICAgcXVvdGUgPSBjaHJcbiAgICAgIH0gZWxzZSBpZiAoIXF1b3RlICYmIGNociA9PT0gJzsnKSB7XG4gICAgICAgIGlmIChrZXkgPT09IGZhbHNlKSB7XG4gICAgICAgICAgcmVzcG9uc2UudmFsdWUgPSB2YWx1ZS50cmltKClcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXNwb25zZS5wYXJhbXNba2V5XSA9IHZhbHVlLnRyaW0oKVxuICAgICAgICB9XG4gICAgICAgIHR5cGUgPSAna2V5J1xuICAgICAgICB2YWx1ZSA9ICcnXG4gICAgICB9IGVsc2Uge1xuICAgICAgICB2YWx1ZSArPSBjaHJcbiAgICAgIH1cbiAgICAgIGVzY2FwZWQgPSBmYWxzZVxuICAgIH1cbiAgfVxuXG4gIGlmICh0eXBlID09PSAndmFsdWUnKSB7XG4gICAgaWYgKGtleSA9PT0gZmFsc2UpIHtcbiAgICAgIHJlc3BvbnNlLnZhbHVlID0gdmFsdWUudHJpbSgpXG4gICAgfSBlbHNlIHtcbiAgICAgIHJlc3BvbnNlLnBhcmFtc1trZXldID0gdmFsdWUudHJpbSgpXG4gICAgfVxuICB9IGVsc2UgaWYgKHZhbHVlLnRyaW0oKSkge1xuICAgIHJlc3BvbnNlLnBhcmFtc1t2YWx1ZS50cmltKCkudG9Mb3dlckNhc2UoKV0gPSAnJ1xuICB9XG5cbiAgLy8gaGFuZGxlIHBhcmFtZXRlciB2YWx1ZSBjb250aW51YXRpb25zXG4gIC8vIGh0dHBzOi8vdG9vbHMuaWV0Zi5vcmcvaHRtbC9yZmMyMjMxI3NlY3Rpb24tM1xuXG4gIC8vIHByZXByb2Nlc3MgdmFsdWVzXG4gIE9iamVjdC5rZXlzKHJlc3BvbnNlLnBhcmFtcykuZm9yRWFjaChmdW5jdGlvbiAoa2V5KSB7XG4gICAgdmFyIGFjdHVhbEtleSwgbnIsIG1hdGNoLCB2YWx1ZVxuICAgIGlmICgobWF0Y2ggPSBrZXkubWF0Y2goLyhcXCooXFxkKyl8XFwqKFxcZCspXFwqfFxcKikkLykpKSB7XG4gICAgICBhY3R1YWxLZXkgPSBrZXkuc3Vic3RyKDAsIG1hdGNoLmluZGV4KVxuICAgICAgbnIgPSBOdW1iZXIobWF0Y2hbMl0gfHwgbWF0Y2hbM10pIHx8IDBcblxuICAgICAgaWYgKCFyZXNwb25zZS5wYXJhbXNbYWN0dWFsS2V5XSB8fCB0eXBlb2YgcmVzcG9uc2UucGFyYW1zW2FjdHVhbEtleV0gIT09ICdvYmplY3QnKSB7XG4gICAgICAgIHJlc3BvbnNlLnBhcmFtc1thY3R1YWxLZXldID0ge1xuICAgICAgICAgIGNoYXJzZXQ6IGZhbHNlLFxuICAgICAgICAgIHZhbHVlczogW11cbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICB2YWx1ZSA9IHJlc3BvbnNlLnBhcmFtc1trZXldXG5cbiAgICAgIGlmIChuciA9PT0gMCAmJiBtYXRjaFswXS5zdWJzdHIoLTEpID09PSAnKicgJiYgKG1hdGNoID0gdmFsdWUubWF0Y2goL14oW14nXSopJ1teJ10qJyguKikkLykpKSB7XG4gICAgICAgIHJlc3BvbnNlLnBhcmFtc1thY3R1YWxLZXldLmNoYXJzZXQgPSBtYXRjaFsxXSB8fCAnaXNvLTg4NTktMSdcbiAgICAgICAgdmFsdWUgPSBtYXRjaFsyXVxuICAgICAgfVxuXG4gICAgICByZXNwb25zZS5wYXJhbXNbYWN0dWFsS2V5XS52YWx1ZXNbbnJdID0gdmFsdWVcblxuICAgICAgLy8gcmVtb3ZlIHRoZSBvbGQgcmVmZXJlbmNlXG4gICAgICBkZWxldGUgcmVzcG9uc2UucGFyYW1zW2tleV1cbiAgICB9XG4gIH0pXG5cbiAgLy8gY29uY2F0ZW5hdGUgc3BsaXQgcmZjMjIzMSBzdHJpbmdzIGFuZCBjb252ZXJ0IGVuY29kZWQgc3RyaW5ncyB0byBtaW1lIGVuY29kZWQgd29yZHNcbiAgT2JqZWN0LmtleXMocmVzcG9uc2UucGFyYW1zKS5mb3JFYWNoKGZ1bmN0aW9uIChrZXkpIHtcbiAgICB2YXIgdmFsdWVcbiAgICBpZiAocmVzcG9uc2UucGFyYW1zW2tleV0gJiYgQXJyYXkuaXNBcnJheShyZXNwb25zZS5wYXJhbXNba2V5XS52YWx1ZXMpKSB7XG4gICAgICB2YWx1ZSA9IHJlc3BvbnNlLnBhcmFtc1trZXldLnZhbHVlcy5tYXAoZnVuY3Rpb24gKHZhbCkge1xuICAgICAgICByZXR1cm4gdmFsIHx8ICcnXG4gICAgICB9KS5qb2luKCcnKVxuXG4gICAgICBpZiAocmVzcG9uc2UucGFyYW1zW2tleV0uY2hhcnNldCkge1xuICAgICAgICAvLyBjb252ZXJ0IFwiJUFCXCIgdG8gXCI9P2NoYXJzZXQ/UT89QUI/PVwiXG4gICAgICAgIHJlc3BvbnNlLnBhcmFtc1trZXldID0gJz0/JyArIHJlc3BvbnNlLnBhcmFtc1trZXldLmNoYXJzZXQgKyAnP1E/JyArIHZhbHVlXG4gICAgICAgICAgLnJlcGxhY2UoL1s9P19cXHNdL2csIGZ1bmN0aW9uIChzKSB7XG4gICAgICAgICAgICAvLyBmaXggaW52YWxpZGx5IGVuY29kZWQgY2hhcnNcbiAgICAgICAgICAgIHZhciBjID0gcy5jaGFyQ29kZUF0KDApLnRvU3RyaW5nKDE2KVxuICAgICAgICAgICAgcmV0dXJuIHMgPT09ICcgJyA/ICdfJyA6ICclJyArIChjLmxlbmd0aCA8IDIgPyAnMCcgOiAnJykgKyBjXG4gICAgICAgICAgfSlcbiAgICAgICAgICAucmVwbGFjZSgvJS9nLCAnPScpICsgJz89JyAvLyBjaGFuZ2UgZnJvbSB1cmxlbmNvZGluZyB0byBwZXJjZW50IGVuY29kaW5nXG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXNwb25zZS5wYXJhbXNba2V5XSA9IHZhbHVlXG4gICAgICB9XG4gICAgfVxuICB9KVxuXG4gIHJldHVybiByZXNwb25zZVxufVxuXG4vKipcbiAqIEVuY29kZXMgYSBzdHJpbmcgb3IgYW4gVWludDhBcnJheSB0byBhbiBVVEYtOCBQYXJhbWV0ZXIgVmFsdWUgQ29udGludWF0aW9uIGVuY29kaW5nIChyZmMyMjMxKVxuICogVXNlZnVsIGZvciBzcGxpdHRpbmcgbG9uZyBwYXJhbWV0ZXIgdmFsdWVzLlxuICpcbiAqIEZvciBleGFtcGxlXG4gKiAgICAgIHRpdGxlPVwidW5pY29kZSBzdHJpbmdcIlxuICogYmVjb21lc1xuICogICAgIHRpdGxlKjAqPVwidXRmLTgnJ3VuaWNvZGVcIlxuICogICAgIHRpdGxlKjEqPVwiJTIwc3RyaW5nXCJcbiAqXG4gKiBAcGFyYW0ge1N0cmluZ3xVaW50OEFycmF5fSBkYXRhIFN0cmluZyB0byBiZSBlbmNvZGVkXG4gKiBAcGFyYW0ge051bWJlcn0gW21heExlbmd0aD01MF0gTWF4IGxlbmd0aCBmb3IgZ2VuZXJhdGVkIGNodW5rc1xuICogQHBhcmFtIHtTdHJpbmd9IFtmcm9tQ2hhcnNldD0nVVRGLTgnXSBTb3VyY2Ugc2hhcmFjdGVyIHNldFxuICogQHJldHVybiB7QXJyYXl9IEEgbGlzdCBvZiBlbmNvZGVkIGtleXMgYW5kIGhlYWRlcnNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNvbnRpbnVhdGlvbkVuY29kZSAoa2V5LCBkYXRhLCBtYXhMZW5ndGgsIGZyb21DaGFyc2V0KSB7XG4gIGNvbnN0IGxpc3QgPSBbXVxuICB2YXIgZW5jb2RlZFN0ciA9IHR5cGVvZiBkYXRhID09PSAnc3RyaW5nJyA/IGRhdGEgOiBkZWNvZGUoZGF0YSwgZnJvbUNoYXJzZXQpXG4gIHZhciBsaW5lXG5cbiAgbWF4TGVuZ3RoID0gbWF4TGVuZ3RoIHx8IDUwXG5cbiAgLy8gcHJvY2VzcyBhc2NpaSBvbmx5IHRleHRcbiAgaWYgKC9eW1xcdy5cXC0gXSokLy50ZXN0KGRhdGEpKSB7XG4gICAgLy8gY2hlY2sgaWYgY29udmVyc2lvbiBpcyBldmVuIG5lZWRlZFxuICAgIGlmIChlbmNvZGVkU3RyLmxlbmd0aCA8PSBtYXhMZW5ndGgpIHtcbiAgICAgIHJldHVybiBbe1xuICAgICAgICBrZXk6IGtleSxcbiAgICAgICAgdmFsdWU6IC9bXFxzXCI7PV0vLnRlc3QoZW5jb2RlZFN0cikgPyAnXCInICsgZW5jb2RlZFN0ciArICdcIicgOiBlbmNvZGVkU3RyXG4gICAgICB9XVxuICAgIH1cblxuICAgIGVuY29kZWRTdHIgPSBlbmNvZGVkU3RyLnJlcGxhY2UobmV3IFJlZ0V4cCgnLnsnICsgbWF4TGVuZ3RoICsgJ30nLCAnZycpLCBmdW5jdGlvbiAoc3RyKSB7XG4gICAgICBsaXN0LnB1c2goe1xuICAgICAgICBsaW5lOiBzdHJcbiAgICAgIH0pXG4gICAgICByZXR1cm4gJydcbiAgICB9KVxuXG4gICAgaWYgKGVuY29kZWRTdHIpIHtcbiAgICAgIGxpc3QucHVzaCh7XG4gICAgICAgIGxpbmU6IGVuY29kZWRTdHJcbiAgICAgIH0pXG4gICAgfVxuICB9IGVsc2Uge1xuICAgIC8vIHByb2Nlc3MgdGV4dCB3aXRoIHVuaWNvZGUgb3Igc3BlY2lhbCBjaGFyc1xuICAgIGNvbnN0IHVyaUVuY29kZWQgPSBlbmNvZGVVUklDb21wb25lbnQoJ3V0Zi04XFwnXFwnJyArIGVuY29kZWRTdHIpXG4gICAgbGV0IGkgPSAwXG4gICAgd2hpbGUgKHRydWUpIHtcbiAgICAgIGxldCBsZW4gPSBtYXhMZW5ndGhcbiAgICAgIC8vIG11c3Qgbm90IHNwbGl0IGhleCBlbmNvZGVkIGJ5dGUgYmV0d2VlbiBsaW5lc1xuICAgICAgaWYgKHVyaUVuY29kZWRbaSArIG1heExlbmd0aCAtIDFdID09PSAnJScpIHtcbiAgICAgICAgbGVuIC09IDFcbiAgICAgIH0gZWxzZSBpZiAodXJpRW5jb2RlZFtpICsgbWF4TGVuZ3RoIC0gMl0gPT09ICclJykge1xuICAgICAgICBsZW4gLT0gMlxuICAgICAgfVxuICAgICAgbGluZSA9IHVyaUVuY29kZWQuc3Vic3RyKGksIGxlbilcbiAgICAgIGlmICghbGluZSkge1xuICAgICAgICBicmVha1xuICAgICAgfVxuICAgICAgbGlzdC5wdXNoKHtcbiAgICAgICAgbGluZTogbGluZSxcbiAgICAgICAgZW5jb2RlZDogdHJ1ZVxuICAgICAgfSlcbiAgICAgIGkgKz0gbGluZS5sZW5ndGhcbiAgICB9XG4gIH1cblxuICByZXR1cm4gbGlzdC5tYXAoZnVuY3Rpb24gKGl0ZW0sIGkpIHtcbiAgICByZXR1cm4ge1xuICAgICAgLy8gZW5jb2RlZCBsaW5lczoge25hbWV9KntwYXJ0fSpcbiAgICAgIC8vIHVuZW5jb2RlZCBsaW5lczoge25hbWV9KntwYXJ0fVxuICAgICAgLy8gaWYgYW55IGxpbmUgbmVlZHMgdG8gYmUgZW5jb2RlZCB0aGVuIHRoZSBmaXJzdCBsaW5lIChwYXJ0PT0wKSBpcyBhbHdheXMgZW5jb2RlZFxuICAgICAga2V5OiBrZXkgKyAnKicgKyBpICsgKGl0ZW0uZW5jb2RlZCA/ICcqJyA6ICcnKSxcbiAgICAgIHZhbHVlOiAvW1xcc1wiOz1dLy50ZXN0KGl0ZW0ubGluZSkgPyAnXCInICsgaXRlbS5saW5lICsgJ1wiJyA6IGl0ZW0ubGluZVxuICAgIH1cbiAgfSlcbn1cblxuLyoqXG4gKiBTcGxpdHMgYSBtaW1lIGVuY29kZWQgc3RyaW5nLiBOZWVkZWQgZm9yIGRpdmlkaW5nIG1pbWUgd29yZHMgaW50byBzbWFsbGVyIGNodW5rc1xuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBzdHIgTWltZSBlbmNvZGVkIHN0cmluZyB0byBiZSBzcGxpdCB1cFxuICogQHBhcmFtIHtOdW1iZXJ9IG1heGxlbiBNYXhpbXVtIGxlbmd0aCBvZiBjaGFyYWN0ZXJzIGZvciBvbmUgcGFydCAobWluaW11bSAxMilcbiAqIEByZXR1cm4ge0FycmF5fSBTcGxpdCBzdHJpbmdcbiAqL1xuZnVuY3Rpb24gX3NwbGl0TWltZUVuY29kZWRTdHJpbmcgKHN0ciwgbWF4bGVuID0gMTIpIHtcbiAgY29uc3QgbWluV29yZExlbmd0aCA9IDEyIC8vIHJlcXVpcmUgYXQgbGVhc3QgMTIgc3ltYm9scyB0byBmaXQgcG9zc2libGUgNCBvY3RldCBVVEYtOCBzZXF1ZW5jZXNcbiAgY29uc3QgbWF4V29yZExlbmd0aCA9IE1hdGgubWF4KG1heGxlbiwgbWluV29yZExlbmd0aClcbiAgY29uc3QgbGluZXMgPSBbXVxuXG4gIHdoaWxlIChzdHIubGVuZ3RoKSB7XG4gICAgbGV0IGN1ckxpbmUgPSBzdHIuc3Vic3RyKDAsIG1heFdvcmRMZW5ndGgpXG5cbiAgICBjb25zdCBtYXRjaCA9IGN1ckxpbmUubWF0Y2goLz1bMC05QS1GXT8kL2kpIC8vIHNraXAgaW5jb21wbGV0ZSBlc2NhcGVkIGNoYXJcbiAgICBpZiAobWF0Y2gpIHtcbiAgICAgIGN1ckxpbmUgPSBjdXJMaW5lLnN1YnN0cigwLCBtYXRjaC5pbmRleClcbiAgICB9XG5cbiAgICBsZXQgZG9uZSA9IGZhbHNlXG4gICAgd2hpbGUgKCFkb25lKSB7XG4gICAgICBsZXQgY2hyXG4gICAgICBkb25lID0gdHJ1ZVxuICAgICAgY29uc3QgbWF0Y2ggPSBzdHIuc3Vic3RyKGN1ckxpbmUubGVuZ3RoKS5tYXRjaCgvXj0oWzAtOUEtRl17Mn0pL2kpIC8vIGNoZWNrIGlmIG5vdCBtaWRkbGUgb2YgYSB1bmljb2RlIGNoYXIgc2VxdWVuY2VcbiAgICAgIGlmIChtYXRjaCkge1xuICAgICAgICBjaHIgPSBwYXJzZUludChtYXRjaFsxXSwgMTYpXG4gICAgICAgIC8vIGludmFsaWQgc2VxdWVuY2UsIG1vdmUgb25lIGNoYXIgYmFjayBhbmMgcmVjaGVja1xuICAgICAgICBpZiAoY2hyIDwgMHhDMiAmJiBjaHIgPiAweDdGKSB7XG4gICAgICAgICAgY3VyTGluZSA9IGN1ckxpbmUuc3Vic3RyKDAsIGN1ckxpbmUubGVuZ3RoIC0gMylcbiAgICAgICAgICBkb25lID0gZmFsc2VcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChjdXJMaW5lLmxlbmd0aCkge1xuICAgICAgbGluZXMucHVzaChjdXJMaW5lKVxuICAgIH1cbiAgICBzdHIgPSBzdHIuc3Vic3RyKGN1ckxpbmUubGVuZ3RoKVxuICB9XG5cbiAgcmV0dXJuIGxpbmVzXG59XG5cbmZ1bmN0aW9uIF9hZGRCYXNlNjRTb2Z0TGluZWJyZWFrcyAoYmFzZTY0RW5jb2RlZFN0ciA9ICcnKSB7XG4gIHJldHVybiBiYXNlNjRFbmNvZGVkU3RyLnRyaW0oKS5yZXBsYWNlKG5ldyBSZWdFeHAoJy57JyArIE1BWF9MSU5FX0xFTkdUSCArICd9JywgJ2cnKSwgJyQmXFxyXFxuJykudHJpbSgpXG59XG5cbi8qKlxuICogQWRkcyBzb2Z0IGxpbmUgYnJlYWtzKHRoZSBvbmVzIHRoYXQgd2lsbCBiZSBzdHJpcHBlZCBvdXQgd2hlbiBkZWNvZGluZyBRUClcbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gcXBFbmNvZGVkU3RyIFN0cmluZyBpbiBRdW90ZWQtUHJpbnRhYmxlIGVuY29kaW5nXG4gKiBAcmV0dXJuIHtTdHJpbmd9IFN0cmluZyB3aXRoIGZvcmNlZCBsaW5lIGJyZWFrc1xuICovXG5mdW5jdGlvbiBfYWRkUVBTb2Z0TGluZWJyZWFrcyAocXBFbmNvZGVkU3RyID0gJycpIHtcbiAgbGV0IHBvcyA9IDBcbiAgY29uc3QgbGVuID0gcXBFbmNvZGVkU3RyLmxlbmd0aFxuICBjb25zdCBsaW5lTWFyZ2luID0gTWF0aC5mbG9vcihNQVhfTElORV9MRU5HVEggLyAzKVxuICBsZXQgcmVzdWx0ID0gJydcbiAgbGV0IG1hdGNoLCBsaW5lXG5cbiAgLy8gaW5zZXJ0IHNvZnQgbGluZWJyZWFrcyB3aGVyZSBuZWVkZWRcbiAgd2hpbGUgKHBvcyA8IGxlbikge1xuICAgIGxpbmUgPSBxcEVuY29kZWRTdHIuc3Vic3RyKHBvcywgTUFYX0xJTkVfTEVOR1RIKVxuICAgIGlmICgobWF0Y2ggPSBsaW5lLm1hdGNoKC9cXHJcXG4vKSkpIHtcbiAgICAgIGxpbmUgPSBsaW5lLnN1YnN0cigwLCBtYXRjaC5pbmRleCArIG1hdGNoWzBdLmxlbmd0aClcbiAgICAgIHJlc3VsdCArPSBsaW5lXG4gICAgICBwb3MgKz0gbGluZS5sZW5ndGhcbiAgICAgIGNvbnRpbnVlXG4gICAgfVxuXG4gICAgaWYgKGxpbmUuc3Vic3RyKC0xKSA9PT0gJ1xcbicpIHtcbiAgICAgIC8vIG5vdGhpbmcgdG8gY2hhbmdlIGhlcmVcbiAgICAgIHJlc3VsdCArPSBsaW5lXG4gICAgICBwb3MgKz0gbGluZS5sZW5ndGhcbiAgICAgIGNvbnRpbnVlXG4gICAgfSBlbHNlIGlmICgobWF0Y2ggPSBsaW5lLnN1YnN0cigtbGluZU1hcmdpbikubWF0Y2goL1xcbi4qPyQvKSkpIHtcbiAgICAgIC8vIHRydW5jYXRlIHRvIG5lYXJlc3QgbGluZSBicmVha1xuICAgICAgbGluZSA9IGxpbmUuc3Vic3RyKDAsIGxpbmUubGVuZ3RoIC0gKG1hdGNoWzBdLmxlbmd0aCAtIDEpKVxuICAgICAgcmVzdWx0ICs9IGxpbmVcbiAgICAgIHBvcyArPSBsaW5lLmxlbmd0aFxuICAgICAgY29udGludWVcbiAgICB9IGVsc2UgaWYgKGxpbmUubGVuZ3RoID4gTUFYX0xJTkVfTEVOR1RIIC0gbGluZU1hcmdpbiAmJiAobWF0Y2ggPSBsaW5lLnN1YnN0cigtbGluZU1hcmdpbikubWF0Y2goL1sgXFx0LiwhP11bXiBcXHQuLCE/XSokLykpKSB7XG4gICAgICAvLyB0cnVuY2F0ZSB0byBuZWFyZXN0IHNwYWNlXG4gICAgICBsaW5lID0gbGluZS5zdWJzdHIoMCwgbGluZS5sZW5ndGggLSAobWF0Y2hbMF0ubGVuZ3RoIC0gMSkpXG4gICAgfSBlbHNlIGlmIChsaW5lLnN1YnN0cigtMSkgPT09ICdcXHInKSB7XG4gICAgICBsaW5lID0gbGluZS5zdWJzdHIoMCwgbGluZS5sZW5ndGggLSAxKVxuICAgIH0gZWxzZSB7XG4gICAgICBpZiAobGluZS5tYXRjaCgvPVtcXGRhLWZdezAsMn0kL2kpKSB7XG4gICAgICAgIC8vIHB1c2ggaW5jb21wbGV0ZSBlbmNvZGluZyBzZXF1ZW5jZXMgdG8gdGhlIG5leHQgbGluZVxuICAgICAgICBpZiAoKG1hdGNoID0gbGluZS5tYXRjaCgvPVtcXGRhLWZdezAsMX0kL2kpKSkge1xuICAgICAgICAgIGxpbmUgPSBsaW5lLnN1YnN0cigwLCBsaW5lLmxlbmd0aCAtIG1hdGNoWzBdLmxlbmd0aClcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGVuc3VyZSB0aGF0IHV0Zi04IHNlcXVlbmNlcyBhcmUgbm90IHNwbGl0XG4gICAgICAgIHdoaWxlIChsaW5lLmxlbmd0aCA+IDMgJiYgbGluZS5sZW5ndGggPCBsZW4gLSBwb3MgJiYgIWxpbmUubWF0Y2goL14oPzo9W1xcZGEtZl17Mn0pezEsNH0kL2kpICYmIChtYXRjaCA9IGxpbmUubWF0Y2goLz1bXFxkYS1mXXsyfSQvaWcpKSkge1xuICAgICAgICAgIGNvbnN0IGNvZGUgPSBwYXJzZUludChtYXRjaFswXS5zdWJzdHIoMSwgMiksIDE2KVxuICAgICAgICAgIGlmIChjb2RlIDwgMTI4KSB7XG4gICAgICAgICAgICBicmVha1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGxpbmUgPSBsaW5lLnN1YnN0cigwLCBsaW5lLmxlbmd0aCAtIDMpXG5cbiAgICAgICAgICBpZiAoY29kZSA+PSAweEMwKSB7XG4gICAgICAgICAgICBicmVha1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChwb3MgKyBsaW5lLmxlbmd0aCA8IGxlbiAmJiBsaW5lLnN1YnN0cigtMSkgIT09ICdcXG4nKSB7XG4gICAgICBpZiAobGluZS5sZW5ndGggPT09IE1BWF9MSU5FX0xFTkdUSCAmJiBsaW5lLm1hdGNoKC89W1xcZGEtZl17Mn0kL2kpKSB7XG4gICAgICAgIGxpbmUgPSBsaW5lLnN1YnN0cigwLCBsaW5lLmxlbmd0aCAtIDMpXG4gICAgICB9IGVsc2UgaWYgKGxpbmUubGVuZ3RoID09PSBNQVhfTElORV9MRU5HVEgpIHtcbiAgICAgICAgbGluZSA9IGxpbmUuc3Vic3RyKDAsIGxpbmUubGVuZ3RoIC0gMSlcbiAgICAgIH1cbiAgICAgIHBvcyArPSBsaW5lLmxlbmd0aFxuICAgICAgbGluZSArPSAnPVxcclxcbidcbiAgICB9IGVsc2Uge1xuICAgICAgcG9zICs9IGxpbmUubGVuZ3RoXG4gICAgfVxuXG4gICAgcmVzdWx0ICs9IGxpbmVcbiAgfVxuXG4gIHJldHVybiByZXN1bHRcbn1cblxuZXhwb3J0IHsgZGVjb2RlLCBlbmNvZGUsIGNvbnZlcnQgfVxuIl19