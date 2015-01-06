'use strict';

var arrayify = require('./arrayify');

module.exports = function (arr) {
  return arrayify(arr).filter(function (item, i) {
    return arr.indexOf(item) === i;
  });
};
