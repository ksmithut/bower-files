'use strict';

module.exports = Component;

var assert     = require('assert');
var debug      = require('debug')('bower-files');
var path       = require('path');
var util       = require('util');
var arrify     = require('arrify');
var globby     = require('globby');
var isAbsolute = require('is-absolute');
var isSymlink  = require('is-symlink-sync');
var assign     = require('object-assign');
var readJson   = require('read-json-sync');

function Component(options) {

  options = normalizeOptions(options);

  try {
    this.json = readJson(path.resolve(options.dir, options.json));
  } catch (err) {
    this.json = {};
  }

  this.name = options.isRoot // TODO deprecate 'self' name
    ? 'self'
    : this.json.name || path.basename(options.dir);
  options.overrides = assign({}, this.json.overrides, options.overrides);
  assign(this.json, options.overrides[this.name]);

  this.files = Component.mainFiles(options.dir, this.json.main);

  this.dependencies = getDependencies(this.json.dependencies, options);
  if (options.isRoot) {
    this.devDependencies = getDependencies(this.json.devDependencies, options);
  }

  Object.defineProperties(this, {
    dir: {
      get: util.deprecate(function () {
        return options.dependencyDir;
      }, 'component.dir: access to dir is deprecated')
    },
    path: {
      get: util.deprecate(function () {
        return options.dir;
      }, 'component.path: access to path is deprecated')
    }
  });
}

Component.mainFiles = function mainFiles(dir, mainDef) {
  if (!mainDef) { return []; }
  return globby.sync(arrify(mainDef), {cwd: dir}).map(function (file) {
    return path.resolve(dir, file);
  });
};

Component.prototype = {
  getDependencies: function (options) {
    options = assign({
      self: false,
      dev: false,
      main: true
    }, options);

    if (options.self && !this.json.main) {
      debug(this.json.name + ' does not have a main property. You may need to override this to include this component\'s files'); /* jshint ignore:line */
    }

    var components = [];
    if (options.main) {
      components = components.concat(this.dependencies || []);
    }
    if (options.dev) {
      var devDependencies = this.devDependencies || [];
      components = options.dev === 'after'
        ? components.concat(devDependencies)
        : devDependencies.concat(components);
    }

    var dependencies = components
      .reduce(function (deps, dep) {
        return deps.concat(dep.getDependencies({self: true}));
      }, [])
      .concat(options.self ? this : []);
    var depNames = dependencies.map(function (dep) { return dep.name; });
    return dependencies.filter(function (dep, i) {
      return depNames.indexOf(dep.name) === i;
    });
  }
};

function getDependencies(dependencies, options) {
  dependencies = dependencies || {};
  return Object.keys(dependencies).map(function (key) {
    return new Component(assign({}, options, {
      dir: path.resolve(options.dependencyDir, key),
      isRoot: false
    }));
  });
}

function normalizeOptions(options) {
  options = assign({
    dir: null,
    dependencyDir: null,
    json: 'bower.json',
    componentJson: '.bower.json',
    overrides: {},
    isRoot: false
  }, options);

  assert(
    isAbsolute(options.dir || ''),
    'options.dir must be absolute'
  );

  assert(
    isAbsolute(options.dependencyDir || ''),
    'options.dependencyDir must be absolute'
  );

  options.json = (options.isRoot || isSymlink(options.dir))
    ? options.json
    : options.componentJson;

  return options;
}
