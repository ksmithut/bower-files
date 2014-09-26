'use strict';
// Core Modules
var path       = require('path');
var fs         = require('fs');
// 3rd Party Modules
var glob       = require('glob');
var defaults   = require('defaults');
var isRelative = require('is-relative');
var merge      = require('merge');

// bowerFiles
// ==========
//
// Gets the library files as defined by bower.json
module.exports = function bowerFiles(options) {
  options = getDefaults(options);
  // clone the bower.json
  var bower = merge(true, require(options.json));
  // Get the dependencies
  var deps  = bower.dependencies;
  if (options.dev) { deps = merge(deps, bower.devDependencies); }
  // If the bower.json has overrides and overrides weren't passed, then use
  // the given ones over the bower.json.
  if (!options.overrides && bower.overrides) {
    options.overrides = bower.overrides;
  }
  // Get the list of file in the order they need to be in with dependencies.
  var files = getDependencies(deps, options);
  return splitByExt(files, options.ext, options.join);
};

// getDefaults
// -----------
//
// Gets the default options, but prefers the given options. The given options
// should be the ones given to `bowerFiles(options)`
function getDefaults(options) {
  options = defaults(options, {
    cwd: process.cwd(),
    json: 'bower.json',
    dir: 'bower_components',
    componentJson: '.bower.json',
    symlinkedJson: 'bower.json',
    ext: true,
    join: false,
    dev: false,
    overrides: false
  });
  options.json = makeAbsolute(options.json, options.cwd);
  options.dir  = makeAbsolute(options.dir, options.cwd);
  return options;
}

// splitByExt
// ----------
//
// Takes in an array of files and splits then up by file extension (given the
// options tell it to).
function splitByExt(files, split, join) {
  var components = {};
  // if split is set to falsy, then just return the files
  if (!split) { return files; }
  // Go through all of the files and split them up by extension
  files.map(function (file) {
    var ext = path.extname(file).replace('.', '');
    components[ext] = components[ext] || [];
    components[ext].push(file);
  });
  // If the join option is set, then join the files with the extensions in.
  if (join) {
    Object.keys(join).map(function (joined) {
      var extensions = join[joined];
      components[joined] = [];
      extensions.map(function (ext) {
        if (components[ext]) {
          components[joined] = components[joined].concat(components[ext]);
        }
      });
    });
  }
  // if the split option is a string, only return the files with the given
  // extension.
  return isString(split) ? components[split] : components;
}

// getDependencies
// ---------------
//
// Gets the dependencies given the dependencies as they should show up in a
// bower.json file. This will look in the bower_components directory for each
// given dependency.
//
// This is called recursively to get the dependencies of dependencies of
// dependencies of dependencies. Most front end libraries will build their
// dependencies in (like jQuery), but some don't (like bootstrap or Backbone)
function getDependencies(dependencies, options) {
  var files = [];
  // Loop through all of the dependencies in the bower.json
  Object.keys(dependencies || {}).map(function (dependency) {
    // Get path to component directory
    var componentPath = path.join(options.dir, dependency);
    // Get the path to the component's .bower.json
    var componentFile = path.join(
      componentPath,
      isSymLink(componentPath) ? options.symlinkedJson : options.componentJson
    );
    // Get the bower.json
    var component = require(componentFile);
    // Put the child dependencies onto the files array
    files = files.concat(getDependencies(component.dependencies, options));
    // Get the main file property
    var override = options.overrides[dependency];
    var main = (override && override.main) || component.main;
    if (!main) {
      throw new Error('No main property specified for ' + dependency);
    }
    // Convert main to an array
    main = Array.isArray(main) ? main : [main];
    // Prepend the absolute uri to each of the main properties and glob if we
    // need to.
    main.map(function (file) {
      var fullPath     = path.join(componentPath, file);
      files = files.concat(glob.sync(fullPath));
    });
  });
  return uniques(files);
}

// isString
// --------
//
// Pretty self explanatory.
function isString(str) {
  return typeof str === 'string' || str instanceof String;
}

// makeAbsolute
// ------------
//
// Makes a filepath absolute if it isn't already
function makeAbsolute(filepath, absDir) {
  return isRelative(filepath) ? path.resolve(absDir, filepath) : filepath;
}

// isSymLink
// ---------
//
// Checks to see if a given filepath is a symlink
function isSymLink(filepath) {
  return fs.existsSync(filepath) && fs.lstatSync(filepath).isSymbolicLink();
}

// uniques
// -------
//
// removes duplicate entries in an array
function uniques(array) {
  return array.filter(function (elem, pos) {
    return array.indexOf(elem) === pos;
  });
}
