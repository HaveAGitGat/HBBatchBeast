var path = require('path')
var murmur32 = require('murmur-32')
var encodeBase32 = require('base32-encode')

function validateTemplate (template) {
  if (typeof template !== 'string') {
    throw new TypeError('template is not a string')
  }

  var re = /(^|[^%])(%%)*%s/
  var first = re.exec(template)
  if (first === null) throw new Error('No replacement token. Template must contain replacement token %s exactly once')

  var pos = first.index + first[0].length
  var second = re.exec(template.substring(pos))
  if (second !== null) throw new Error('Multiple replacement tokens. Template must contain replacement token %s exactly once')
}

function replaceToken (template, noise) {
  return template.replace(/%([%s])/g, function ($0, $1) {
    return ($1 === 's' ? noise : $1)
  })
}

var invocations = 0
var localRandom = String(Math.random())

function randomPath (directory, template) {
  validateTemplate(template)

  var hash = murmur32(localRandom + String(process.pid) + String(++invocations))
  var noise = encodeBase32(hash, 'Crockford')

  return path.join(directory, replaceToken(template, noise))
}

module.exports = randomPath
module.exports.validateTemplate = validateTemplate
