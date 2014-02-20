'use strict';

var _    = require('lodash')
  , path = require('path')
  , bowerFiles
  , resolvePath
  , processDependencies
  , splitByExtension
  , defaults
  , removeDups
  ;

// bowerFiles
// ==========
//
// bowerFiles reads your bower.json file and gets the files split up by
// extension
bowerFiles = function (options) {
  var bower, files, components, overrides;
  // gets the default options
  options = defaults(options);
  // get project bower.json
  try {
    bower = require(options.json);
    // Check to see that the project has dependencies
    overrides = bower.overrides || {};
    files = processDependencies(bower.dependencies, options.dir, overrides);
  } catch (exception) {
    files = new Error('Error reading project bower.json: ' + options.json);
  }
  // Error handling
  if (files instanceof Error) {
    if (options.throw) {
      throw files;
    } else {
      return files;
    }
  }
  return splitByExtension(files, options.ext);
};

// defaults
// --------
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
    throw: true
  }, options);
  // resolves the paths to the given paths
  options.json = resolvePath(options.json);
  options.dir  = resolvePath(options.dir);
  return options;
};

// resolvePath
// -----------
//
// resolvePath is a function that determines the absolute path to a file given a
// filepath. If the filepath begins with a `/`, then it is assumes that an
// absolute path was given. Otherwise, it assumes a relative path was given, and
// it will be based on `process.cwd()`.
//
// ### Parameters
//
// - `filepath` (String) - The path to the file. It can be absolute or relative
//
// ### Returns
//
// - `filepath` (String) - the filepath given, but in absolute form. If the
// given path was relative, then it will assume that it's relative based on
// `process.cwd()`.
resolvePath = function (filepath) {
  if (filepath.charAt(0) === '/') {
    return filepath;
  } else {
    return path.join(process.cwd(), filepath);
  }
};

// processDependencies
// -------------------
//
// Determines the files to be included from the bower components.
//
// ### Parameters
//
// - `dependencies` (Object) - The bower components as determined from
// `bower.json`
// - `baseDir` (String) - The path to the `bower_components` directory
// - `overrides` (Object) - the overrides to override bower component properties
// such as when a bower component has a missing 'main' property
//
// ### Returns
//
// - `files` (Array) - An array of files to be included in the order they need
// to be in to be properly included in a project (most dependeded upon first)
//
// It can also return an error if any of the dependencies are missing or if the
// main property is missing
processDependencies = function (dependencies, baseDir, overrides) {
  var err, files = [];
  // Take the dependencies and just take the keys that we'll use for filepaths
  dependencies = Object.keys(dependencies || {});
  // Loop through each of the dependencies with a .some so we can break out if
  // there is an error.
  dependencies.some(function (dependency) {
    var componentPath      = path.join(baseDir, dependency)
      , componentBowerPath = path.join(componentPath, '.bower.json')
      , component, main, children
      ;
    // Try to get the component's .bower.json. If it doesn't exist, it likely
    // means that the user didn't use `bower install`
    try {
      component = require(componentBowerPath);
    } catch (exception) {
      err = new Error('Missing dependency "' +
        dependency +
        '". Did you `bower install`?'
      );
      return true;
    }
    // Get the child dependencies
    children = processDependencies(component.dependencies, baseDir, overrides);
    // If files isn't an array, it is an error
    if (children instanceof Error) {
      err = children;
      return true;
    }
    files = files.concat(children);
    // Get the main property
    main = overrides[dependency] ? overrides[dependency].main : component.main;
    // If main doesn't exist, we ned to let the user know to add it to the
    // package file
    if (!main) {
      err = new Error('No main property: "' +
        dependency +
        '". Add to the overrides property in your component package file.'
      );
      return true;
    }
    // if main is a string, convert it to an array
    main = _.isArray(main) ? main : [main];
    // Prepend the absolute uri to each of the main properties
    main.map(function (file) {
      files.push(path.join(componentPath, file));
    });
  });

  if (err) { return err; }
  return removeDups(files);
};

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

// removeDups
// ----------
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

module.exports = bowerFiles;
