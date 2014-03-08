'use strict';

var fs = require('fs')
  , exists
  ;

// exists
// ======
//
// Checkes to see if a file exists
//
// ### Parameters
//
// - `filepath` (String) - The absolute filepath to check
//
// ### Returns
//
// - `fileExists` (Boolean) - True if the filepath exists, false if otherwise
exists = function (filepath) {
  return fs.existsSync(filepath);
};

module.exports = exists;
