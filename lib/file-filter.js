'use strict';

var arrayify   = require('./utils/arrayify');
var BowerFiles = require('./bower-files');
var assign     = require('object-assign');

function FileFilter(bowerFiles) {
  if (!(this instanceof FileFilter)) { return new FileFilter(bowerFiles); }
  if (!(bowerFiles instanceof BowerFiles)) {
    throw new Error('Must pass valid BowerFiles instance');
  }

  this.bowerFiles = bowerFiles;
  this.grouping = {};

  Object.defineProperty(this, 'files', {
    get: function () {

    }
  });
}

var filter = FileFilter.prototype;

filter.filter = function (options) {
  var self = this._getFileFilter();
  options = options || {};
  Object.keys(options).forEach(function (key) {
    var option = options[key];
    if (option && typeof this[key] === 'function') {
      this[key](option);
    }
  }, self);
  return self;
};

filter.self = function () {
  var self = this._getFileFilter();
  self.grouping.self = true;
  return self;
};

filter.dev = function () {
  var self = this._getFileFilter();
  self.grouping.dev = true;
  return self;
};

filter.include = function (componentNames) {
  var self = this._getFileFilter();
  componentNames = arrayify(componentNames);
  self.grouping.include = self.grouping.include || [];
  self.grouping.include.push.apply(self.grouping.include, componentNames);
  return self;
};

filter.exclude = function (componentNames) {
  var self = this._getFileFilter();
  componentNames = arrayify(componentNames);
  self.grouping.exclude = self.grouping.exclude || [];
  self.grouping.exclude.push.apply(self.grouping.exclude, componentNames);
  return self;
};

filter.ext = function (extensions) {
  var self = this._getFileFilter();
  extensions = arrayify(extensions);
  self.grouping.extensions = self.grouping.extensions || [];
  self.grouping.extensions.push.apply(self.grouping.extensions, extensions);
  return self;
};

filter.join = function (joins) {
  var self = this._getFileFilter();
  self.grouping.join = self.grouping.join || {};
  assign(self.grouping.join, joins);
  return self;
};

filter.match = function (glob) {
  var self = this._getFileFilter();
  self.grouping.globs = self.grouping.globs || [];
  self.grouping.globs.push(glob);
  return self;
};

filter._getFileFilter = function () {
  if (this instanceof BowerFiles) { return new FileFilter(this); }
  return this;
};
