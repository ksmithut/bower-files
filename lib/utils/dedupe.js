'use strict';

module.exports = function (arr) {
  return arr.filter(function (item, i) {
    if (!item) { return false; }
    return arr.indexOf(item) === i;
  });
};
