'use strict';

module.exports = function dependencies(depHash, dir, overrides) {
  depHash = depHash || {};
  return Object.keys(depHash).map(function (dependency) {
    return new require('../component')({
      dir: dir,
      name: dependency,
      overrides: overrides
    });
  });
};
