'use strict';

var path = require('path')
  , resolvePath
  ;

// resolvePath
// ===========
//
// resolvePath is a function that determines the absolute path to a file given a
// filepath. If the filepath begins with a `/`, then it is assumes that an
// absolute path was given. Otherwise, it assumes a relative path was given, and
// it will be based on `process.cwd()`.
//
// ### Parameters
//
// - `filepath` (String) - The path to the file. It can be absolute or relative
//
// ### Returns
//
// - `filepath` (String) - the filepath given, but in absolute form. If the
// given path was relative, then it will assume that it's relative based on
// `process.cwd()`.
resolvePath = function (filepath) {
  if (filepath.charAt(0) === '/') {
    return filepath;
  } else {
    return path.join(process.cwd(), filepath);
  }
};

module.exports = resolvePath;
