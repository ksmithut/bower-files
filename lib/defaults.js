'use strict';

var _           = require('lodash')
  , resolvePath = require('./resolve-path')
  , exists      = require('./exists')
  , defaults
  ;

// defaults
// ========
//
// takes in the given options and returns the resulting object with the required
// properties
//
// ### Parameters
//
// - `options` (Object) - An object with 0 or more of the following properties:
//     - `json` (String) - A path to the `bower.json`
//     - `dir` (String) - A path to the `bower_components`
//     - `ext` (Boolean/String) - Boolean to split it up by the extension or
//     not, String to get a list of a specific extension.
defaults = function (options) {
  // gets the default options
  options = _.assign({
    json: 'bower.json',
    dir: 'bower_components',
    ext: true,
    dev: false,
    throw: false
  }, options);
  // resolves the paths to the given paths
  options.json = resolvePath(options.json);
  options.dir  = resolvePath(options.dir);
  if (!exists(options.json)) {
    options.error = new Error('Error reading project ' + options.json);
  }
  // Could check to see if the directory exists.
  return options;
};

module.exports = defaults;
