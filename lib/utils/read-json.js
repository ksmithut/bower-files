'use strict';

var fs = require('fs');

module.exports = function (path) {
  if (!fs.existsSync(path)) { return {}; }
  try {
    return JSON.parse(fs.readFileSync(path, 'utf8'));
  } catch (err) {
    // TODO do something with this error. Could be a readFile error or a JSON
    // parsing error

    return {};
  }
};
