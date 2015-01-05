'use strict';

var BowerFiles = require('./lib/bower-files');

module.exports = function (options) {
  var files = new BowerFiles(options);

  return files.getFiles(options);
};

