'use strict';

var path = require('path')
  , DRIVE_REGEX = /^\w:\\/
  , resolvePath
  , isAbsolute
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
  if (isAbsolute(filepath)) {
    return filepath;
  } else {
    return path.join(process.cwd(), filepath);
  }
};

isAbsolute = function (filepath) {
  var abs;
  // This is kind of a hacky way of doing things. This brings up the issue of
  // whether or not we should be using relative paths throughout or not.
  switch (process.platform) {
    case 'win32':
      abs = !!filepath.match(DRIVE_REGEX);
      break;
    default:
      abs = filepath.charAt(0) === path.sep;
  }
  return abs;
};

module.exports = resolvePath;
