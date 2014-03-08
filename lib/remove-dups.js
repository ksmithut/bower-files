'use strict';

var removeDups;

// removeDups
// ==========
//
// Removes the duplicate elements of an array, keeping the earlier version
//
// ### Parameters
//
// - `arr` (Array) - an array to remove duplicate items
//
// ### Returns
//
// - `arr` (Array) - the same array given without duplicate items
removeDups = function (arr) {
  return arr.filter(function (elem, pos) {
    return arr.indexOf(elem) === pos;
  });
};

module.exports = removeDups;
