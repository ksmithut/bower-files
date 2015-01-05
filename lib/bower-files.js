'use strict';

var path          = require('path');
var MainComponent = require('./main-component');
var getOptions    = require('./utils/get-options');
var dedupe        = require('./utils/dedupe');
var assign        = require('object-assign');

function BowerFiles(options) {
  if (!(this instanceof BowerFiles)) { return new BowerFiles(options); }
  // Get options
  options = getOptions(options);
  // Get bower.json
  var bower = require(options.json);

  this.options = options;

  this.component = new MainComponent({
    dir: options.dir,
    json: bower,
    mainDir: path.dirname(options.json)
  });

  return this;
}

BowerFiles.prototype.getFiles = function (options) {
  var files = [];
  var main  = this.component;

  var opts = assign({
    self: false,
    dev: false,
    join: false,
    ext: true
  }, options);

  var getFiles = function (component) {
    files = files.concat(component.getFiles());
  };

  if (opts.dev) { main.devDependencies.forEach(getFiles); }
  main.dependencies.forEach(getFiles);
  if (opts.self) { files = files.concat(main.files); }

  files = dedupe(files);

  if (!opts.ext) { return files; }

  files = files.reduce(function (files, file) {
    var ext = path.extname(file).substr(1);
    files[ext] = files[ext] || [];
    files[ext].push(file);
    return files;
  }, {});

  if (opts.join) {
    Object.keys(opts.join).map(function (joined) {
      var extensions = opts.join[joined];
      files[joined] = [];
      extensions.map(function (ext) {
        if (files[ext]) {
          files[joined] = files[joined].concat(files[ext]);
        }
      });
    });
  }

  return opts.ext !== true ? files[opts.ext] : files;
};

module.exports = BowerFiles;
