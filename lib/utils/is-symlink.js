'use strict';

var fs = require('fs');

module.exports = function isSymLink(filepath) {
  var exists = true;
  /* istanbul ignore if: until fs.access becomes standard, this needs to stay */
  if (fs.accessSync) {
    try {
      fs.accessSync(filepath, fs.F_OK);
    } catch (err) {
      exists = false;
    }
  } else {
    exists = fs.existsSync(filepath);
  }
  return exists && fs.lstatSync(filepath).isSymbolicLink();
};
