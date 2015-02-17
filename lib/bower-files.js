'use strict';

module.exports = BowerFiles;

var util          = require('util');
var path          = require('path');
var BowerConfig   = require('bower-config');
var assign        = require('object-assign');
var isAbsolute    = require('is-absolute');
var json          = require('read-json-sync');
var untildify     = require('untildify');
var MainComponent = require('./main-component');
var FileFilter    = require('./file-filter');

/**
 * @class BowerFiles
 */
function BowerFiles(options) {
  if (!(this instanceof BowerFiles)) { return new BowerFiles(options); }

  // Initialize the normalize the configuration
  this._initConfig(options);

  // Get the main bower file
  this._component = new MainComponent({
    json: json(this._config.json),
    dir: path.dirname(this._config.json),
    componentsDir: this._config.dir,
    overrides: this._config.overrides,
    componentJson: this._config.componentJson
  });

  // Inheric from FileFilter
  FileFilter.call(this);
}
util.inherits(BowerFiles, FileFilter);

/**
 * @name {Array|Object} BowerFiles.old
 * @description A method to conform to the 2.x version of this module.
 */
BowerFiles.old = function (options) {
  options = options || {};
  options = assign({ext: true, join: {}}, options);
  var lib = new BowerFiles(options)
    .self(Boolean(options.self))
    .dev(Boolean(options.dev))
    .dev(Boolean(options.dev))
    .ext(options.ext)
    .join(options.join);
  return lib.files;
};

/**
 * @name BowerFiles#_initConfig
 * @description Initializes the configuration of the BowerFiles instance.
 */
BowerFiles.prototype._initConfig = function (options) {
  // Default options
  // We don't pass in dir, because if it isn't passed, we wan the default to
  // come from .bowerc
  this._config = assign({
    cwd: process.cwd(),
    json: 'bower.json',
    overrides: {},
    componentJson: '.bower.json',
    camelCase: true
  }, options);

  // check if this._config.cwd is absolute
  if (!isAbsolute(this._config.cwd)) {
    throw new Error('options.cwd must be an absolute path');
  }

  // If a dir option wasn't given, lets read the bowerrc files
  // @see https://github.com/bower/config
  if (!this._config.dir) {
    // This gets us the cwd and directory options that we can use.
    var bowerrc = new BowerConfig(this._config.cwd).load().toObject();
    // Normalize the cwd and directories given by bowerrc
    bowerrc.cwd = untildify(bowerrc.cwd);
    bowerrc.directory = untildify(bowerrc.directory);
    this._config.dir = path.resolve(bowerrc.cwd, bowerrc.directory);
  } else {
    this._config.dir = path.resolve(this._config.cwd, this._config.dir);
  }

  // Make the json option absolute
  this._config.json = path.resolve(this._config.cwd, this._config.json);
};
