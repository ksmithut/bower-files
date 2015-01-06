'use strict';

var BowerFiles = require('./lib/bower-files');

module.exports = function (options) {
  var bowerFiles = new BowerFiles(options);
  var files      = files.getFiles(options);
  var components = files.getComponents();
  files.get = function (componentName, options) {
    if (!components[componentName]) { return; }
    return components[componentName].getFiles(options);
  };
  return files;
};

