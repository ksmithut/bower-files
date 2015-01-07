'use strict';

module.exports = MainComponent;

var path      = require('path');
var assign    = require('object-assign');
var mainFiles = require('./utils/main-files');
var getDeps   = require('./utils/get-deps');

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
    overrides: this.overrides
  };

  this.files = mainFiles(this.json.main, this.dir);
  this.dependencies = getDeps(this.json.dependencies, depOptions);
  this.devDependencies = getDeps(this.json.devDependencies, depOptions);

}


