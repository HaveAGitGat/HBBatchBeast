var tape = require('tape');
var fs = require('fs');
var ffprobe = require('..');

tape('ffprobe path should exist on fs', function (t) {
  var stats = fs.statSync(ffprobe.path);
  t.ok(stats.isFile(ffprobe.path));
  t.end();
});
