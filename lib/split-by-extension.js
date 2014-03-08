'use strict';

var path = require('path')
  , _    = require('lodash')
  , splitByExtension
  ;

// splitByExtension
// ----------------
//
// Takes in an array of filepaths and splits up the paths by extension
//
// ### Parameters
//
// - `filepaths` (Array) - the array of filepaths to include
// - `splitExt` (Boolean/String) - Boolean to split it up by the extension or
// not, String to get a list of a specific extension.
//
// ### Returns
//
// - components (Object/Array) - an object who's keys are the extensions, and
// the properties of each are arrays of filespaths.
splitByExtension = function (filepaths, splitExt) {
  var files      = filepaths
    , components = {}
    ;
  if (splitExt) {
    filepaths.map(function (filepath) {
      var ext = path.extname(filepath).replace('.', '');
      components[ext] = components[ext] || [];
      components[ext].push(filepath);
    });
    if (_.isString(splitExt)) {
      components = components[splitExt];
    }
    files = components;
  }
  return files;
};

module.exports = splitByExtension;
