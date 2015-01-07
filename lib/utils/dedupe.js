'use strict';

module.exports = function (arr) {
  return arr.filter(function (val, i) {
    return arr.indexOf(val) === i;
  });
};
