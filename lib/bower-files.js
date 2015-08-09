'use strict';

module.exports = BowerFiles;

var assert      = require('assert');
var path        = require('path');
var util        = require('util');
var arrify      = require('arrify');
var BowerConfig = require('bower-config');
var camelcase   = require('camelcase');
var isAbsolute  = require('is-absolute');
var minimatch   = require('minimatch');
var assign      = require('object-assign');
var untildify   = require('untildify');
var Component   = require('./component');

function BowerFiles(options, filters) {
  if (!(this instanceof BowerFiles)) { return new BowerFiles(options); }

  this.options = normalizeOptions(options);

  this.component = new Component({
    dir: options.cwd,
    dependencyDir: options.dir,
    json: options.json,
    componentJson: options.componentJson,
    overrides: options.overrides,
    isRoot: true
  });

  this.filters = assign({
    ext: [],
    match: [],
    join: {},
    camelCase: true
  }, filters);

  this.cwd = options.cwd;
}

BowerFiles.prototype = {
  _newThis: function () {
    return new BowerFiles(this.options, this.filters);
  }
};


function normalizeOptions(options) {
  if (options && typeof options.camelCase !== 'undefined') {
    console.log('bowerFiles.options.camelCase: Use .camelCase(true).');
  }
  options = assign({
    cwd: process.cwd(),
    json: 'bower.json',
    overrides: {},
    componentJson: '.bower.json',
    camelCase: true,
    dir: null
  }, options);

  assert(
    isAbsolute(options.cwd || ''),
    'options.cwd must be an absolute path'
  );

  if (!options.dir) {
    var bowerrc = new BowerConfig(options.cwd).load().toObject();
    options.cwd = untildify(bowerrc.cwd);
    options.dir = untildify(bowerrc.directory);
  }
  options.dir = path.resolve(options.cwd, options.dir);

  return options;
}


