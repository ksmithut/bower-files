'use strict';

var arrayify = require('./arrayify');

module.exports = function (dependencies, files) {
  return dependencies.reduce(function (files, dependency) {
    return files.concat(dependency.getFiles());
  }, []).concat(arrayify(files));
};
