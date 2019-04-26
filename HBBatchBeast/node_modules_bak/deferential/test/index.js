var expect = require('expect.js'),
    Promise = require('native-promise-only');
    path = require('path'),
    fs = require('fs'),
    Deferred = require('..');

function fixture(fileName) {
  return path.join(__dirname, 'fixtures', fileName);
}

describe('deferential', function() {
  // Dual API node function
  function getFile(fileName, cb) {
    var d = Deferred();
    fs.readFile(fileName, 'utf8', d.resolver());
    return d.nodeify(cb);
  }

  // Dual API node function with multiple return variables
  function cbMulti(n, cb) {
    var d = Deferred();
    setImmediate(function () {
      var cb = d.resolver();
      // return square and cube of n as multiple arguments
      cb(null, n*n, n*n*n);
    });
    return d.nodeify(cb, { spread: true });
  }

  it('should resolve', function(done) {
    var d = Deferred();

    setImmediate(function () {
      d.resolve(42);
    });

    d.promise
      .then(function (val) {
        expect(val).to.equal(42);
        done();
      })
      .catch(function (err) {
        done(err);
      });
  });

  it('should reject', function(done) {
    var d = Deferred();

    setImmediate(function () {
      d.reject(new Error('there was an error'));
    });

    d.promise
      .then(function (val) {
        done(new Error('Received ' + val));
      })
      .catch(function (err) {
        setImmediate(function () {
          // to force error throws
          expect(err.message).to.equal('there was an error');
          done();
        });
      });
  });

  it('should have a promise', function(done) {
    var d = Deferred();
    expect(d.promise).to.be.a(Promise);
    done();
  });

  it('should handle callback apis (success)', function(done) {
    getFile(fixture('test.txt'), function (err, data) {
      if (err) return done(err);
      expect(data).to.equal('hello, world\n');
      done();
    })
  });

  it('should handle callback apis (failure)', function(done) {
    var ret = getFile(fixture('not-here.txt'), function (err, data) {
      expect(data).to.not.be.ok();
      expect(err.code).to.equal('ENOENT');
      done();
    })
    expect(ret).to.be(undefined);
  });

  it('should handle promise apis (success)', function(done) {
    getFile(fixture('test.txt'))
      .then(function (data) {
        expect(data).to.equal('hello, world\n');
        done();
      })
      .catch(function (err) {
        if (err) return done(err);
      });
  });

  it('should handle promise apis (failure)', function(done) {
    getFile(fixture('not-here.txt'))
      .then(function (data) {
        expect(data).to.not.be.ok();
        done(new Error('Received ' + data));
      })
      .catch(function (err) {
        setImmediate(function () {
          expect(err.code).to.equal('ENOENT');
          done();
        });
      });
  });

  it('should handle multiple return args (cb)', function(done) {
    cbMulti(2, function (err, square, cube) {
      if (err) return done(err);
      expect(square).to.equal(4);
      expect(cube).to.equal(8);
      done();
    });
  });

  it('should handle multiple return args (promise)', function(done) {
    cbMulti(2)
      .then(function (val) {
        expect(val).to.eql([4, 8]);
        done();
      })
      .catch(function (err) {
        setImmediate(function () {
          done(err);
        });
      });
  });
});
