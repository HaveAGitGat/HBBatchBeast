var temp = require('./lib/temp')
var randomPath = require('random-path')

function promisify (fn) {
  return function () {
    var that = this
    var args = new Array(arguments.length)

    for (var i = 0; i < arguments.length; i++) {
      args[i] = arguments[i]
    }
    return new Promise(function (resolve, reject) {
      args.push(function (err, res) {
        if (err) return reject(err)

        resolve(res)
      })

      fn.apply(that, args)
    })
  }
}

function template (template) {
  randomPath.validateTemplate(template)

  return {
    open: promisify(temp.open.bind(temp, template)),
    openSync: temp.openSync.bind(temp, template),
    mkdir: promisify(temp.mkdir.bind(temp, template)),
    mkdirSync: temp.mkdirSync.bind(temp, template),
    writeFile: promisify(temp.writeFile.bind(temp, template)),
    writeFileSync: temp.writeFileSync.bind(temp, template),
    createWriteStream: temp.createWriteStream.bind(temp, template)
  }
}

module.exports = template('%s')
module.exports.template = template
