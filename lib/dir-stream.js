var fs = require('fs'),
    path = require('path'),
    pi = require('pipe-iterators');

function resolveDir(dirname) {
  var basepath = dirname + (dirname[dirname.length - 1] !== path.sep ? path.sep : '');

  fs.readdirSync(basepath).map(function(f) {
    return basepath + f;
  }).forEach(function(filepath) {
    var stat = fs.lstatSync(filepath);
    if (stat.isDirectory()) {
      resolveDir.call(this, filepath);
    } else {
      this.push({ path: filepath, stat: stat });
    }
  }, this);
}

module.exports = function() {
  return pi.thru.obj(function(filepath, enc, done) {
    var stat = fs.lstatSync(filepath);
    if (stat.isDirectory()) {
      resolveDir.call(this, filepath);
    } else {
      this.push({ path: filepath, stat: stat });
    }
    done();
  });
};
