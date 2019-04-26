module.exports = function arrayBufferFromString (input) {
  var length = input.length
  var view = new Uint16Array(length)

  for (var i = 0; i < length; i++) {
    view[i] = input.charCodeAt(i)
  }

  return view.buffer
}
