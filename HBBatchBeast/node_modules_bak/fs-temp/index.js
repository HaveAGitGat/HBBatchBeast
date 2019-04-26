var temp = require('./lib/temp')
var randomPath = require('random-path')

function template (template) {
  randomPath.validateTemplate(template)

  return {
    open: temp.open.bind(temp, template),
    openSync: temp.openSync.bind(temp, template),
    mkdir: temp.mkdir.bind(temp, template),
    mkdirSync: temp.mkdirSync.bind(temp, template),
    writeFile: temp.writeFile.bind(temp, template),
    writeFileSync: temp.writeFileSync.bind(temp, template),
    createWriteStream: temp.createWriteStream.bind(temp, template)
  }
}

module.exports = template('%s')
module.exports.template = template
