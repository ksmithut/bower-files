'use strict';

module.exports = FileFilter;

var BowerFiles = require('./bower-files');
var dedupe     = require('./utils/dedupe');

function FileFilter(bowerFiles) {
  if (this instanceof BowerFiles) { return; }
  this.bowerFiles = bowerFiles;
  this.options = {};
}

var filter = FileFilter.prototype;

filter._filter = function () {
  if (this instanceof BowerFiles) { return new FileFilter(this); }
  return this;
};

/**
 * @function FileFilter.include
 */
filter.include = function () {
  var self = this._filter();

  return self;
};
filter.get = filter.include;

/**
 * @function FileFilter.exlude
 */
filter.exlude = function () {
  var self = this._filter();

  return self;
};

/**
 * @function FileFilter.match
 */
filter.match = function () {
  var self = this._filter();

  return self;
};

/**
 * @function FileFilter.ext
 */
filter.ext = function () {
  var self = this._filter();

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

Object.defineProperty(filter, 'files', {
  get: function () {
    var self = this._filter();
    return dedupe(self.bowerFiles._component.getFiles(this.options));
  }
});
