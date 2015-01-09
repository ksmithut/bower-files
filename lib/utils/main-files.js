'use strict';

var path     = require('path');
var glob     = require('glob');
var arrayify = require('./arrayify');

module.exports = function mainFiles(main, dir) {
  var files = [];
  arrayify(main).forEach(function (pattern) {
    glob.sync(pattern, {cwd: dir}).forEach(function (file) {
      files.push(path.resolve(dir, file));
    });
  });
  return files;
};
