'use strict';

var path         = require('path');
var assign       = require('object-assign');

var isSymlink    = require('./utils/is-symlink');
var mainFiles    = require('./utils/main-files');
var dependencies = require('./utils/dependencies');

function Component(options) {
  if (!(this instanceof Component)) { return new Component(options); }

  options = assign({
    dir: null,
    name: null
  }, options);

  assign(this, options);

  if (!this.name || !this.dir) {
    throw new Error('You must pass a dir and name option');
  }

  var jsonFile = isSymlink(options.dir) ? 'bower.json' : '.bower.json';

  this.path         = path.resolve(this.dir, this.name);
  this.json         = require(path.resolve(this.path, jsonFile));
  this.files        = mainFiles(this.json.main, this.path);
  this.dependencies = dependencies(this.json.dependencies, this.dir);

  return this;
}

Component.prototype.getFiles = function (deps) {
  var files = [];
  deps = deps || this.dependencies;
  deps.map(function (component) {
    files = files.concat(component.files);
  });
  return files.concat(this.files);
};

module.exports = Component;
