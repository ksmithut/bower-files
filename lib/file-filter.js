'use strict';

module.exports = FileFilter;

var BowerFiles = require('./bower-files');
var dedupe     = require('./utils/dedupe');

function FileFilter(bowerFiles) {
  if (this instanceof BowerFiles) { return; }
  this.bowerFiles = bowerFiles;
}

var filter = FileFilter.prototype;

filter._filter = function () {
  if (this instanceof BowerFiles) { return new FileFilter(this); }
  return this;
};

Object.defineProperty(filter, 'files', {
  get: function () {
    var self = this._filter();
    return dedupe(self.bowerFiles._component.getFiles());
  }
});
