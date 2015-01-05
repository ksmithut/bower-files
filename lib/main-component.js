'use strict';

var path         = require('path');
var assign       = require('object-assign');
var Component    = require('./component');
var arrayify     = require('./utils/arrayify');
var mainFiles    = require('./utils/main-files');
var dependencies = require('./utils/dependencies');

function MainComponent(options) {
  if (!(this instanceof MainComponent)) { return new MainComponent(options); }

  var opts = assign({
    mainDir: '',
    dir: '',
    json: {}
  }, options);

  assign(this, opts);

  this.files = mainFiles(this.json.main, this.mainDir);

  ['dependencies', 'devDependencies'].forEach(function (depType) {
    this[depType] = dependencies(this.json[depType], this.dir);
  }, this);

  return this;
}

module.exports = MainComponent;
