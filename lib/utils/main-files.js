'use strict';

var path     = require('path');
var glob     = require('glob');
var arrayify = require('./arrayify');

module.exports = function mainFiles(main, dir) {
  var files = [];
  arrayify(main).forEach(function (mainFile) {
    glob.sync(mainFile, {cwd: dir}).forEach(function (file) {
      files.push(path.resolve(dir, file));
    }, this);
  }, this);
  return files;
};
