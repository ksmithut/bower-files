'use strict';

module.exports = function dependencies(depHash, dir) {
  depHash = depHash || {};
  return Object.keys(depHash).map(function (dependency) {
    return new require('../component')({
      dir: dir,
      name: dependency
    });
  });
};
