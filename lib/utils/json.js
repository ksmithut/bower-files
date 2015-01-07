'use strict';

var fs = require('fs');

module.exports = function json(path) {
  return JSON.parse(fs.readFileSync(path, 'utf8'));
};
