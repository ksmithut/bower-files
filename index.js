'use strict';

var BowerFiles = require('./lib/bower-files');

module.exports = function (options) {
  var bowerFiles = new BowerFiles(options);
  return bowerFiles.getFiles(options);
};

