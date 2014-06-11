'use strict';

var fs = require('fs');

// isSymlink
// ======
//
// Checkes to see if a file is a symbolic link
//
// ### Parameters
//
// - `filepath` (String) - The absolute filepath to check
//
// ### Returns
//
// - `fileIsSymlink` (Boolean) - True if the filepath is a symlink, false if
//   otherwise
function isSymlink(filepath) {
  return fs.existsSync(filepath) && fs.lstatSync(filepath).isSymbolicLink();
}

module.exports = isSymlink;
