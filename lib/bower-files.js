'use strict';

var _    = require('lodash')
  , path = require('path')
  , fs   = require('fs')
  , bowerFiles
  , processDependencies = require('./process-dependencies')
  , splitByExtension = require('./split-by-extension')
  , defaults = require('./defaults')
  ;

// bowerFiles
// ==========
//
// bowerFiles reads your bower.json file and gets the files split up by
// extension
//
// ### Parameters
//
//
bowerFiles = function (options) {
  var bower, files, components, overrides, dependencies;
  // gets the default options
  options = defaults(options);
  // Return the error if there was an error
  if (options.error) { return options.error; }
  // get project bower.json
  // This shouldn't throw an error because we checked for the file's existance
  // when we got the options
  bower = require(options.json);
  // Check to see that the project has dependencies
  files = processDependencies(bower.dependencies, options.dir, bower.overrides);
  if (files.error) { return files.error; }
  return splitByExtension(files.paths, options.ext);
};

module.exports = bowerFiles;
