'use strict';

var path       = require('path');
var fs         = require('fs');
var glob       = require('glob');
var defaults   = require('defaults');
var isRelative = require('is-relative');
var merge      = require('merge');

module.exports = function bowerFiles(options) {
  // Get defaults
  options = defaults(options, {
    json: 'bower.json',
    dir: 'bower_components',
    componentJson: '.bower.json',
    symlinkedJson: 'bower.json',
    ext: true,
    join: false,
    dev: false,
    overrides: {}
  });
  // Set up absolute paths
  var cwd = process.cwd();
  options.json = makeAbsolute(options.json, cwd);
  options.dir  = makeAbsolute(options.dir, cwd);
  // Get the bower.json
  var bower = clone(require(options.json));
  // Get the dependencies
  var deps = bower.dependencies;
  // get the devDependencies if the option was specified
  if (options.dev) { deps = merge(deps, bower.devDependencies); }
  // put the override options onto the options object.
  if (bower.overrides) { options.overrides = bower.overrides; }
  // get the files from the main bower.json dependency directory.
  var files = getDependencies(deps, options);
  // split by extension if needed
  return splitByExt(files, options.ext, options.join);
};

function splitByExt(files, split, join) {
  var components = {};
  if (!split) { return files; }
  files.map(function (file) {
    var ext = path.extname(file).replace('.', '');
    components[ext] = components[ext] || [];
    components[ext].push(file);
  });
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
  return isString(split) ? components[split] : components;
}

function isString(str) {
  return typeof str === 'string' || str instanceof String;
}

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

function makeAbsolute(filepath, absDir) {
  return isRelative(filepath) ? path.resolve(absDir, filepath) : filepath;
}

function clone(object) { return merge(true, object); }

function isSymLink(filepath) {
  return fs.existsSync(filepath) && fs.lstatSync(filepath).isSymbolicLink();
}

function uniques(array) {
  return array.filter(function (elem, pos) {
    return array.indexOf(elem) === pos;
  });
}
