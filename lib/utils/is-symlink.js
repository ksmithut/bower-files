'use strict';

var fs = require('fs');

module.exports = function isSymLink(filepath) {
  // TODO remove this ternary thing when fs.existsSync is no longer in use.
  var exists = fs.accessSync ?
    !fs.accessSync(filepath, fs.F_OK) :
    fs.existsSync(filepath);
  return exists && fs.lstatSync(filepath).isSymbolicLink();
};
