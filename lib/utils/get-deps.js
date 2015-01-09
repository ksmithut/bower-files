'use strict';

var assign = require('object-assign');

module.exports = function getDependencies(depsDefinition, options) {
  depsDefinition = depsDefinition || {};
  var Component = require('../component');
  return Object.keys(depsDefinition).map(function (dependency) {
    return new Component(assign({name: dependency}, options));
  });
};
