'use strict';

var path     = require('path');
var globby   = require('globby');
var arrayify = require('./arrayify');

module.exports = function mainFiles(main, dir) {
  return globby.sync(arrayify(main), {cwd: dir}).map(function (file) {
    return path.resolve(dir, file);
  });
};
