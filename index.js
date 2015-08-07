'use strict';

module.exports = BowerFiles;

var assert      = require('assert');
var path        = require('path');
var util        = require('util');
var BowerConfig = require('bower-config');
var isAbsolute  = require('is-absolute');
var assign      = require('object-assign');
var untildify   = require('untildify');
var Component   = require('./lib/component');
var FileFilter  = require('./lib/file-filter');

function BowerFiles(options) {
  if (!(this instanceof BowerFiles)) { return new BowerFiles(options); }

  options = normalizeOptions(options);

  this.component = new Component({
    dir: options.cwd,
    dependencyDir: options.dir,
    json: options.json,
    componentJson: options.componentJson,
    overrides: options.overrides,
    isRoot: true
  });

  this._fileFilterConfig = {
    camelCase: options.camelCase,
    cwd: options.cwd
  };

  // TODO deprecate
  this._config = options;
  this._component = this.component;

  FileFilter.call(this);
}
util.inherits(BowerFiles, FileFilter);


BowerFiles.old = function (options) {
  options = assign({ext: true, join: {}}, options);
  return new BowerFiles(options)
    .self(Boolean(options.self))
    .dev(Boolean(options.dev))
    .ext(options.ext)
    .join(options.join)
    .files;
};


function normalizeOptions(options) {
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


