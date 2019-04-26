var fs = require('fs')
var os = require('os')
var randomPath = require('random-path')

var retry = require('./retry')
var WriteStream = require('./write-stream')

var tmpdir = os.tmpdir()

function open (template, flags, mode, cb) {
  switch (flags) {
    case 'w': flags = 'wx'; break
    case 'w+': flags = 'wx+'; break
    default: throw new Error('Unknown file open flag: ' + flags)
  }

  if (typeof mode === 'function') {
    cb = mode
    mode = undefined
  }

  var path

  retry.async(function (cb) {
    path = randomPath(tmpdir, template)
    fs.open(path, flags, mode, cb)
  }, function (err, fd) {
    cb(err, err ? undefined : { fd: fd, path: path })
  })
}

function openSync (template, flags, mode) {
  switch (flags) {
    case 'w': flags = 'wx'; break
    case 'w+': flags = 'wx+'; break
    default: throw new Error('Unknown file open flag: ' + flags)
  }

  var path

  var fd = retry.sync(function () {
    path = randomPath(tmpdir, template)
    return fs.openSync(path, flags, mode)
  })

  return { fd: fd, path: path }
}

function mkdir (template, mode, cb) {
  if (typeof mode === 'function') {
    cb = mode
    mode = undefined
  }

  var path

  retry.async(function (cb) {
    path = randomPath(tmpdir, template)
    fs.mkdir(path, mode, cb)
  }, function (err) {
    cb(err, err ? undefined : path)
  })
}

function mkdirSync (template, mode) {
  var path

  retry.sync(function () {
    path = randomPath(tmpdir, template)
    fs.mkdirSync(path, mode)
  })

  return path
}

function writeFile (template, data, options, cb) {
  cb = arguments[arguments.length - 1]

  if (typeof options === 'function' || !options) {
    options = { flag: 'wx' }
  } else if (typeof options === 'string') {
    options = { encoding: options, flag: 'wx' }
  } else if (typeof options === 'object') {
    options.flag = 'wx'
  } else {
    throw new TypeError('Bad arguments')
  }

  var path

  retry.async(function (cb) {
    path = randomPath(tmpdir, template)
    fs.writeFile(path, data, options, cb)
  }, function (err) {
    cb(err, err ? undefined : path)
  })
}

function writeFileSync (template, data, options, cb) {
  if (!options) {
    options = { flag: 'wx' }
  } else if (typeof options === 'string') {
    options = { encoding: options, flag: 'wx' }
  } else if (typeof options === 'object') {
    options.flag = 'wx'
  } else {
    throw new TypeError('Bad arguments')
  }

  var path

  retry.sync(function () {
    path = randomPath(tmpdir, template)
    fs.writeFileSync(path, data, options)
  })

  return path
}

function createWriteStream (template, options) {
  return new WriteStream(template, options)
}

exports.open = open
exports.openSync = openSync
exports.mkdir = mkdir
exports.mkdirSync = mkdirSync
exports.writeFile = writeFile
exports.writeFileSync = writeFileSync
exports.createWriteStream = createWriteStream
