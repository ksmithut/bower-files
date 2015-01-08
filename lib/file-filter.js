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
    match: [],
    join: {}
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
 * @function FileFilter.join
 */
filter.join = function (joinDef) {
  var self = this._filter();
  assign(self.options.join, joinDef);
  return self;
};

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
  if (val === false) { return self; }
  if (val === true) {
    self.options.ext = true;
  } else {
    self.options.ext = self.options.ext.concat(arrayify(val));
  }
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
    var files = dedupe(self.bowerFiles._component.getFiles(self.options));
    // use match option
    files = patternMatch(files, self.options.match);
    // Use ext option
    // If it's an array and it has a length greater than 1
    files = extensionSplit(files, self.options.ext, self.options.join);
    return files;
  }
});

function patternMatch(files, patterns) {
  patterns.forEach(function (pattern) {
    files = files.filter(minimatch.filter(pattern));
  });
  return files;
}

function extensionSplit(files, ext, join) {
  if (!ext || ext.length === 0) { return files; }
  files = files.reduce(function (files, file) {
    var ext = path.extname(file).substr(1);
    files[ext] = files[ext] || [];
    files[ext].push(file);
    return files;
  }, {});
  Object.keys(join).forEach(function (joinExt) {
    var extensions = join[joinExt];
    files[joinExt] = files[joinExt] || [];
    files[joinExt] = extensions.reduce(function (jointArr, ext) {
      if (!files[ext]) { return jointArr; }
      return jointArr.concat(files[ext]);
    }, files[joinExt]);
  });
  if (ext.length) {
    files = ext.reduce(function (extArray, ext) {
      return extArray.concat(files[ext]);
    }, []);
  }
  return files;
}
