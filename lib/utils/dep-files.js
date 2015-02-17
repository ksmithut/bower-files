'use strict';

var arrayify = require('arrify');
var assign   = require('object-assign');

function depFiles(dependencies, files) {
  return dependencies.reduce(function (files, dependency) {
    return files.concat(dependency.getFiles());
  }, []).concat(arrayify(files));
}

depFiles.depHash = function depHash(dependencies, camelCase) {
  return dependencies.reduce(function (files, dependency) {
    return assign(files, dependency.getDeps(camelCase));
  }, {});
};

module.exports = depFiles;
