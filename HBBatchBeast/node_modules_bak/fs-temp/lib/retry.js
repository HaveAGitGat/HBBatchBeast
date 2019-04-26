
function sync (fn) {
  var res
  var tries = 3

  while (--tries) {
    try {
      res = fn()
    } catch (err) {
      if (err.code === 'EEXIST') continue

      throw err
    }

    return res
  }

  throw new Error('Failed to find unique name')
}

function async (fn, cb) {
  var tries = 3

  ;(function next () {
    fn(function (err, res) {
      if (!err) return cb(null, res)
      if (err.code !== 'EEXIST') return cb(err)
      if (--tries === 0) return cb(new Error('Failed to find unique name'))

      next()
    })
  }())
}

exports.sync = sync
exports.async = async
