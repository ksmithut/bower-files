'use strict';

module.exports = FileFilter;

var path       = require('path');
var arrayify   = require('arrify');
var minimatch  = require('minimatch');
var assign     = require('object-assign');
var uniq       = require('array-uniq');
var BowerFiles = require('./bower-files');

/**
 * @class FileFilter
 * @description A separate class is used in order to be able to use the
 * chainable methods without modifying the contents that come out.
 */
function FileFilter(bowerFiles, options) {
  if (this instanceof BowerFiles) { return; }
  this.bowerFiles = bowerFiles;
  this.options = assign({
    ext: [],
    match: [],
    join: {},
    camelCase: this.bowerFiles._config.camelCase
  }, options || {});
}

var filter = FileFilter.prototype;

/**
 * @description Used to the the File Filter out of bowerFiles
 */
filter._filter = function () {
  if (this instanceof BowerFiles) {
      return new FileFilter(this);
  } else {
      return new FileFilter(this.bowerFiles, this.options);
  }
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
  self.options.match = self.options.match.concat(arrayify(val));
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
filter.dev = boolOption('dev', true);

/**
 * @function FileFilter.self
 */
filter.self = boolOption('self', true);

/**
 * @function FileFilter.main
 */
filter.main = boolOption('main', true);

/**
 * @function FileFilter.relative
 */
filter.relative = function(val) {
    var self = this._filter();
    self.options.relative = val ? val : process.cwd();
    return self;
};

function boolOption(name, defaultVal) {
  return function (val) {
    var self = this._filter();
    self.options[name] = typeof val === 'boolean' ? val : defaultVal;
    return self;
  };
}

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

Object.defineProperty(filter, 'deps', {
  get: function () {
    var self = this._filter();

    var deps = self.bowerFiles._component.getDeps(self.options);

    return Object.keys(deps).reduce(function (finalDeps, depName) {
      var files = deps[depName];
      files = patternMatch(files, self.options.match);
      files = extensionSplit(files, self.options.ext, self.options.join);
      finalDeps[depName] = files;
      return finalDeps;
    }, {});
  }
});

Object.defineProperty(filter, 'files', {
  get: function () {
    var self = this._filter();
    // use dev and self options
    var files = uniq(self.bowerFiles._component.getFiles(self.options));
    // use match option
    files = patternMatch(files, self.options.match);
    // Use ext option
    // If it's an array and it has a length greater than 1
    files = extensionSplit(files, self.options.ext, self.options.join);
    if (self.options.relative) {
        files = makeRelative(files, self.options.relative);
    }
    return files;
  }
});

function makeRelative(files, cwd) {
    return files.map(function(file) {
        return path.relative(cwd, file);
    });
}

function patternMatch(files, patterns) {
  patterns.forEach(function (pattern) {
    files = files.filter(minimatch.filter(pattern));
  });
  return files;
}

function extensionSplit(files, exts, join) {
  if (!exts || exts.length === 0) { return files; }
  // Split files up by extension
  files = files.reduce(function (files, file) {
    var ext = path.extname(file).substr(1);
    files[ext] = files[ext] || [];
    files[ext].push(file);
    return files;
  }, {});
  // Get things from the join option
  Object.keys(join).forEach(function (joinExt) {
    var extensions = join[joinExt];
    files[joinExt] = files[joinExt] || [];
    files[joinExt] = extensions.reduce(function (jointArr, ext) {
      if (!files[ext]) { return jointArr; }
      return jointArr.concat(files[ext]);
    }, files[joinExt]);
  });
  // if extension is an array of strings, get the extensions given
  if (exts.length) {
    files = exts.reduce(function (extArray, ext) {
      return extArray.concat(files[ext] || []);
    }, []);
  }
  return files;
}
