'use strict';

module.exports = function (arr) {
  return arr.filter(function (item, i) {
    return arr.indexOf(item) === i;
  });
};
