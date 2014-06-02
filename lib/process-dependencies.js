'use strict';

var path       = require('path')
  , glob       = require('glob')
  , _          = require('lodash')
  , exists     = require('./exists')
  , removeDups = require('./remove-dups')
  , processDependencies
  ;

// processDependencies
// ===================
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
  var files = {
    paths: []
  };
  // Take the dependencies and just take the keys that we'll use for filepaths
  dependencies = Object.keys(dependencies || {});
  overrides    = overrides || {};
  // Loop through each of the dependencies with a .some so we can break out if
  // there is an error.
  dependencies.some(function (dependency) {
    var componentPath      = path.join(baseDir, dependency)
      , componentBowerPath = path.join(componentPath, '.bower.json')
      , component, main, children
      ;
    if (!exists(componentBowerPath)) {
      files.error = new Error('Missing dependency "' + dependency + '"');
      return true;
    }
    // Try to get the component's .bower.json. If it doesn't exist, it likely
    // means that the user didn't use `bower install`
    component = require(componentBowerPath);
    // Get the child dependencies
    children = processDependencies(component.dependencies, baseDir, overrides);
    if (children.error) {
      files.error = children.error;
      return true;
    }
    files.paths = files.paths.concat(children.paths);
    // Get the main property
    main = overrides[dependency] ? overrides[dependency].main : component.main;
    // If main doesn't exist, we ned to let the user know to add it to the
    // package file
    if (!main) {
      files.error = new Error(
        'No main property: "' + dependency +
        '". Add to the overrides property in your component package file.'
      );
      return true;
    }
    // if main is a string, convert it to an array
    main = _.isArray(main) ? main : [main];
    // Prepend the absolute uri to each of the main properties and glob if we
    // need to.
    main.map(function (file) {
      var fullPath     = path.join(componentPath, file)
        , globbedFiles = glob.sync(fullPath)
        ;
      files.paths.push(fullPath);
      console.log(globbedFiles);
    });
  });
  files.paths = removeDups(files.paths);
  return files;
};

module.exports = processDependencies;
