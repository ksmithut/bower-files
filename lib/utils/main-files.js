'use strict';

var path     = require('path');
var arrayify = require('arrify');
var globby   = require('globby');

module.exports = function mainFiles(main, dir) {
  return globby.sync(arrayify(main), {cwd: dir}).map(function (file) {
    return path.resolve(dir, file);
  });
};
