'use strict';

var fs = require('fs');

module.exports = function (path) {
  if (!fs.existsSync(path)) { return {}; }
  return JSON.parse(fs.readFileSync(path, 'utf8'));
};
