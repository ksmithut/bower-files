'use strict';

module.exports = function arrayify(obj) {
  if (obj === null || obj === undefined) { return []; }
  return Array.isArray(obj) ? obj : [obj];
};
