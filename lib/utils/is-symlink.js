'use strict';

var fs = require('fs');

module.exports = function isSymLink(filepath) {
  // TODO fs.existsSync will be deprecated with io.js. Need to use alternate
  // method to check for file existance
  return fs.existsSync(filepath) && fs.lstatSync(filepath).isSymbolicLink();
};
