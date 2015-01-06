'use strict';

var path         = require('path');
var assign       = require('object-assign');

var readJson     = require('./utils/read-json');
var isSymlink    = require('./utils/is-symlink');
var mainFiles    = require('./utils/main-files');
var dependencies = require('./utils/dependencies');

function Component(options) {
  if (!(this instanceof Component)) { return new Component(options); }

  options = assign({
    dir: null,
    name: null,
    overrides: {}
  }, options);

  assign(this, options);

  if (!this.name || !this.dir) {
    throw new Error('You must pass a dir and name option');
  }


  this.path    = path.resolve(this.dir, this.name);
  var jsonFile = isSymlink(this.path) ? 'bower.json' : '.bower.json';
  this.json    = readJson(path.resolve(this.path, jsonFile));

  var main = this.json.main;
  var deps = this.json.dependencies;
  if (this.overrides[this.name]) {
    main = this.overrides[this.name].main || main;
    deps = this.overrides[this.name].dependencies || deps;
  }

  this.files        = mainFiles(main, this.path);
  this.dependencies = dependencies(deps, this.dir, this.overrides);

  if (!this.files.length) {
    throw new Error(this.name + ' is missing or does not have any main files.');
  }

  return this;
}

Component.prototype.getFiles = function () {
  var files = [];
  this.dependencies.map(function (component) {
    files = files.concat(component.files);
  });
  return files.concat(this.files);
};

module.exports = Component;
