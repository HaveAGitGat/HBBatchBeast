var temp = require('./temp')
var WriteStream = require('fs').WriteStream

function TempWriteStream (template, options) {
  this.template = template
  WriteStream.call(this, null, options)
}

TempWriteStream.prototype = Object.create(WriteStream.prototype)

TempWriteStream.prototype.open = function open () {
  temp.open(this.template, this.flags, this.mode, function (err, info) {
    if (err) {
      this.destroy()
      this.emit('error', err)
      return
    }

    this.fd = info.fd
    this.path = info.path
    this.emit('path', info.path)
    this.emit('open', info.fd)
  }.bind(this))
}

module.exports = TempWriteStream
