'use strict';

var path     = require('path');
var assign   = require('object-assign');
var Config   = require('bower-config');
var readJson = require('./read-json');

var BOWERRC  = '.bowerrc';
var ROOT_DIR = path.resolve('/');
var HOME_DIR = require('userhome')();

function getOptions(options) {
  var tmpOptions = assign({
    cwd: process.cwd(),
    json: 'bower.json'
  }, options);

  tmpOptions.dir = defaultDir(tmpOptions);
  tmpOptions.json = path.resolve(tmpOptions.cwd, tmpOptions.json);

  return tmpOptions;
}

function defaultDir(options) {
  options.dirCwd = options.cwd;
  // Order of precedence for directory
  // 1. Given option
  if (options && options.dir) {
    return path.resolve(options.dirCwd, options.dir);
  }
  // 2. Merge .bowerrc files in the given directory until we get both the
  //    `cwd` and `directory` options, or until we reach `/`
  var bowerrc = new Config(options.cwd).load().toObject();

  options.dirCwd = bowerrc.cwd.replace('~', HOME_DIR);
  return path.resolve(options.dirCwd, bowerrc.directory);
}

module.exports = getOptions;
