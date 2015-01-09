'use strict';

module.exports = function dedupe(arr) {
  return arr.filter(function (val, i) {
    return arr.indexOf(val) === i;
  });
};
