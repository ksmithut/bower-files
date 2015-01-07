'use strict';

module.exports = BowerFiles;

var path          = require('path');
var BowerConfig   = require('bower-config');
var assign        = require('object-assign');
var home          = require('user-home');
var isAbsolute    = require('is-absolute');
var MainComponent = require('./main-component');

/**
 * @class BowerFiles
 */
function BowerFiles(options) {
  if (!(this instanceof BowerFiles)) { return new BowerFiles(options); }

  // Initialize the normalize the configuration
  this._initConfig(options);

  // Get the main bower file
  this._component = new MainComponent({
    json: require(this._config.json),
    dir: path.dirname(this._config.json),
    componentsDir: this._config.dir,
    overrides: this._config.overrides,
    componentJson: this._config.componentJson
  });
}

/**
 * @name BowerFiles._initConfig
 */
BowerFiles.prototype._initConfig = function (options) {
  // Default options
  // We don't pass in dir, because if it isn't passed, we wan the default to
  // come from .bowerc
  this._config = assign({
    cwd: process.cwd(),
    json: 'bower.json',
    overrides: {},
    componentJson: '.bower.json'
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
    bowerrc.cwd = bowerrc.cwd.replace('~', home);
    bowerrc.directory = bowerrc.directory.replace('~', home);
    this._config.dir = path.resolve(bowerrc.cwd, bowerrc.directory);
  } else {
    this._config.dir = path.resolve(this._config.cwd, this._config.dir);
  }

  // Make the json option absolute
  this._config.json = path.resolve(this._config.cwd, this._config.json);
};
