var Promise = require('native-promise-only');

module.exports = Deferred;
function Deferred() {
	if (!(this instanceof Deferred)) {
    return new Deferred();
  }

	var self = this;
  this.promise = new Promise(function (resolve, reject) {
    self.resolve = resolve;
    self.reject = reject;
  });
};
Deferred.Promise = Promise;

Deferred.prototype.nodeify = function (cb, opts) {
  if (typeof opts === 'undefined') {
    opts = { spread: false };
  }
  if (typeof cb === 'function') {
    this.promise
      .then(function (val) {
        var args;
        if (opts.spread && Array.isArray(val)) {
          args = val;
          args.unshift(null);
        } else {
          args = [null, val];
        }
        cb.apply(null, args);
      })
      .catch(function (err) {
        cb(err);
      });
  } else {
    return this.promise;
  }
};

Deferred.prototype.resolver = function () {
  var self = this;
  return function (err, results) {
    var args = Array.prototype.slice.call(arguments);
    if (err) {
      return self.reject(err);
    }
    args.shift(); // drop err
    self.resolve(args.length === 1 ? args[0] : args);
  };
};

function noop() {}
