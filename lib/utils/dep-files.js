'use strict';

var assign   = require('object-assign');
var arrayify = require('./arrayify');

function depFiles(dependencies, files) {
  return dependencies.reduce(function (files, dependency) {
    return files.concat(dependency.getFiles());
  }, []).concat(arrayify(files));
}

depFiles.depHash = function depHash(dependencies, files) {
  return dependencies.reduce(function (files, dependency) {
    return assign(files, dependency.getDeps());
  }, {});
};

module.exports = depFiles;
