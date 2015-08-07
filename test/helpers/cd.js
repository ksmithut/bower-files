'use strict';

var path        = require('path');
var originalDir = process.cwd();

module.exports = function (base) {
  var fixturesDir = path.resolve(__dirname, '..', base);
  var current     = originalDir;
  function cd(dir) {
    current = path.resolve(fixturesDir, dir);
    process.chdir(current);
  }
  cd.reset = cd.bind(null, originalDir);
  return cd;
};
