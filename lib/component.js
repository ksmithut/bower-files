'use strict';

module.exports = Component;

var path      = require('path');
var assign    = require('object-assign');
var mainFiles = require('./utils/main-files');
var getDeps   = require('./utils/get-deps');
var isSymlink = require('./utils/is-symlink');
var depFiles  = require('./utils/dep-files');

function Component(options) {

  // options = {
  //   name: '',
  //   dir: ''
  // }
  assign(this, options);

  // Set the path
  this.path = path.resolve(this.dir, this.name);

  // Get this bower.json
  var bowerFile = isSymlink(this.path) ? 'bower.json' : this.componentJson;
  this.json = require(path.resolve(this.path, bowerFile));

  // Apply the overrides
  this.overrides = assign(this.json.overrides || {}, this.overrides);
  assign(this.json, this.overrides[this.name]);

  // Get the main files
  this.files = mainFiles(this.json.main, this.path);

  // Get the dependencies
  this.dependencies = getDeps(this.json.dependencies, {
    dir: this.dir,
    overrides: this.overrides,
    componentJson: this.componentJson
  });

}

Component.prototype.getFiles = function () {
  return depFiles(this.dependencies, this.files);
};
