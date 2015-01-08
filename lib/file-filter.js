'use strict';

module.exports = FileFilter;

var path       = require('path');
var minimatch  = require('minimatch');
var assign     = require('object-assign');
var BowerFiles = require('./bower-files');
var dedupe     = require('./utils/dedupe');
var arrayify   = require('./utils/arrayify');

function FileFilter(bowerFiles) {
  if (this instanceof BowerFiles) { return; }
  this.bowerFiles = bowerFiles;
  this.options = {
    ext: [],
    match: []
  };
}

var filter = FileFilter.prototype;

filter._filter = function () {
  if (this instanceof BowerFiles) { return new FileFilter(this); }
  return this;
};

/**
 * @function FileFilter.include
 * TODO implement FileFilter.include
 */
// filter.include = function () {
//   var self = this._filter();
//
//   return self;
// };
// filter.get = filter.include;

/**
 * @function FileFilter.exlude
 * TODO implement FileFilter.exclude
 */
// filter.exlude = function () {
//   var self = this._filter();
//
//   return self;
// };

/**
 * @function FileFilter.match
 */
filter.match = function (val) {
  var self = this._filter();
  self.options.match = self.options.ext.concat(arrayify(val));
  return self;
};

/**
 * @function FileFilter.ext
 */
filter.ext = function (val) {
  var self = this._filter();
  self.options.ext = self.options.ext.concat(arrayify(val));
  return self;
};

/**
 * @function FileFilter.dev
 */
filter.dev = function (val) {
  var self = this._filter();
  self.options.dev = typeof val === 'boolean' ? val : true;
  return self;
};

/**
 * @function FileFilter.self
 */
filter.self = function (val) {
  var self = this._filter();
  self.options.self = typeof val === 'boolean' ? val : true;
  return self;
};

/**
 * @function FileFilter.filter
 */
filter.filter = function (options) {
  var self = this._filter();
  options.ext = arrayify(options.ext);
  options.match = arrayify(options.match);
  assign(self.options, options);
  return self.files;
};

Object.defineProperty(filter, 'files', {
  get: function () {
    var self = this._filter();
    // use dev and self options
    var files = dedupe(self.bowerFiles._component.getFiles(this.options));

    // use ext option
    if (self.options.ext.length) {
      files = files.filter(function (file) {
        return self.options.ext.indexOf(path.extname(file).substr(1)) !== -1;
      });
    }

    // use match option
    if (self.options.match.length) {
      self.options.match.forEach(function (pattern) {
        files = files.filter(minimatch.filter(pattern));
      });
    }

    return files;
  }
});
