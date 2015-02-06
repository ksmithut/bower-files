'use strict';

module.exports = MainComponent;

var path        = require('path');
var assign      = require('object-assign');
var mainFiles   = require('./utils/main-files');
var getDeps     = require('./utils/get-deps');
var depFiles    = require('./utils/dep-files');

function MainComponent(options) {

  // options: {
  //   json: {
  //     main: [],
  //     dependencies: {},
  //     devDependencies: {}
  //   }
  //   dir: '',
  //   componentsDir: '',
  //   overrides: {}
  // }
  assign(this, options);

  var depOptions = {
    dir: this.componentsDir,
    overrides: assign(this.json.overrides || {}, this.overrides),
    componentJson: this.componentJson
  };

  this.files = mainFiles(this.json.main, this.dir);
  this.dependencies = getDeps(this.json.dependencies, depOptions);
  this.devDependencies = getDeps(this.json.devDependencies, depOptions);

  var self = this;

}

MainComponent.prototype.getFiles = function (options) {
  options = assign({
    dev: false,
    self: false
  }, options);

  return depFiles(
    options.dev ? this.devDependencies : [],
    depFiles(this.dependencies, options.self ? this.files : [])
  );
};

MainComponent.prototype.getDeps = function (options) {
  options = assign({
    dev: false,
    self: false
  }, options);

  var hash = {};
  if (options.self) {
    hash.self = this.files;
  }

  return assign(
    hash,
    depFiles.depHash(this.dependencies, options.camelCase),
    options.dev ? depFiles.depHash(this.devDependencies, options.camelCase) : {}
  );
};
