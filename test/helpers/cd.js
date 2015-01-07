'use strict';

var path        = require('path');
var originalDir = process.cwd();
var fixturesDir = path.resolve(__dirname, '..', 'fixtures');
var current     = originalDir;

function cd(dir) {
  current = path.resolve(fixturesDir, dir);
  process.chdir(current);
}

cd.reset = function () {
  cd(originalDir);
};

module.exports = cd;
