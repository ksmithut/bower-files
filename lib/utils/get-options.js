'use strict';

var path     = require('path');
var assign   = require('object-assign');
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
  var bowerrc = {};
  var filetreeDir = path.dirname(path.resolve(options.cwd, BOWERRC));
  while (filetreeDir !== ROOT_DIR || (bowerrc.cwd && bowerrc.directory)) {
    bowerrc = assign(readJson(path.join(filetreeDir, BOWERRC)), bowerrc);
    filetreeDir = path.resolve(filetreeDir, '..');
  }
  // 2a get home directory bowerrc
  bowerrc = assign(readJson(path.join(HOME_DIR, BOWERRC)), bowerrc);

  options.dirCwd = (bowerrc.cwd || options.cwd).replace('~', HOME_DIR);
  if (bowerrc.directory) {
    return path.resolve(options.dirCwd, bowerrc.directory);
  }
  // 3. Return default
  return path.resolve(options.dirCwd, 'bower_components');
}

module.exports = getOptions;
