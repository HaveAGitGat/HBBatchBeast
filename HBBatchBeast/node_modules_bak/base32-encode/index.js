var RFC4648 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'
var RFC4648_HEX = '0123456789ABCDEFGHIJKLMNOPQRSTUV'
var CROCKFORD = '0123456789ABCDEFGHJKMNPQRSTVWXYZ'

module.exports = function base32Encode (buffer, variant) {
  var alphabet, padding

  switch (variant) {
    case 'RFC3548':
    case 'RFC4648':
      alphabet = RFC4648
      padding = true
      break
    case 'RFC4648-HEX':
      alphabet = RFC4648_HEX
      padding = true
      break
    case 'Crockford':
      alphabet = CROCKFORD
      padding = false
      break
    default:
      throw new Error('Unknown base32 variant: ' + variant)
  }

  var length = buffer.byteLength
  var view = new Uint8Array(buffer)

  var bits = 0
  var value = 0
  var output = ''

  for (var i = 0; i < length; i++) {
    value = (value << 8) | view[i]
    bits += 8

    while (bits >= 5) {
      output += alphabet[(value >>> (bits - 5)) & 31]
      bits -= 5
    }
  }

  if (bits > 0) {
    output += alphabet[(value << (5 - bits)) & 31]
  }

  if (padding) {
    while ((output.length % 8) !== 0) {
      output += '='
    }
  }

  return output
}
