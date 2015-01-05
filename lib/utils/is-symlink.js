'use strict';

var fs = require('fs');

module.exports = function isSymLink(filepath) {
  return fs.existsSync(filepath) && fs.lstatSync(filepath).isSymbolicLink();
};
