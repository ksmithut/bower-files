'use strict';

var path       = require('path');
var fs         = require('fs');
var expect     = require('expect.js');
var cd         = require('./helpers/cd');
var BowerFiles = require('../lib/bower-files');

describe('BowerFiles', function () {

  afterEach(function () {
    cd.reset();
  });

  // CONFIGURATION TESTING
  // =====================
  describe('configuration', function () {

    it('should set default configurations', function () {
      cd('default');
      var files = new BowerFiles();
      expect(files._config).to.be.eql({
        cwd: path.resolve(__dirname, 'fixtures', 'default'),
        json: path.resolve(__dirname, 'fixtures', 'default', 'bower.json'),
        dir: path.resolve(__dirname, 'fixtures', 'default', 'bower_components'),
        overrides: {},
        componentJson: '.bower.json'
      });
    });

    it('should fail if cwd isn\'t absolute', function () {
      cd('default');
      var files, error;
      try { files = new BowerFiles({ cwd: 'default' }); }
      catch(err) { error = err; }
      expect(files).to.be(undefined);
      expect(error).to.be.an(Error);
    });

    it('should respect .bowerrc', function () {
      cd('bowerrc');
      var files = new BowerFiles();
      expect(files._config).to.be.eql({
        cwd: path.resolve(__dirname, 'fixtures', 'bowerrc'),
        json: path.resolve(__dirname, 'fixtures', 'bowerrc', 'bower.json'),
        dir: path.resolve(__dirname, 'fixtures', 'bowerrc', 'components'),
        overrides: {},
        componentJson: '.bower.json'
      });
    });

    it('should respect given dir option', function () {
      /* jshint newcap: false */
      cd('default');
      var files = BowerFiles({dir: 'components'});
      expect(files._config).to.be.eql({
        cwd: path.resolve(__dirname, 'fixtures', 'default'),
        json: path.resolve(__dirname, 'fixtures', 'default', 'bower.json'),
        dir: path.resolve(__dirname, 'fixtures', 'default', 'components'),
        overrides: {},
        componentJson: '.bower.json'
      });
    });

    it('should respect custom bower.json file', function () {
      cd('components');
      var files = new BowerFiles({json: 'component.json'});
      expect(files._component.dependencies).to.have.length(2);
    });

    it('should respect custom component configuration files', function () {
      cd('components');
      var files = new BowerFiles({
        json: 'component.json',
        componentJson: 'bower.json'
      });
      expect(files._component.dependencies[0].files).to.be.eql([
        path.resolve(__dirname, 'fixtures', 'components', 'bower_components',
          'bootstrap', 'dist', 'js', 'npm.js')
      ]);
    });

    it('should respect given overrides', function () {
      cd('default');
      var files = new BowerFiles({
        overrides: {jquery: {main: 'dist/jquery.min.js'}}
      });
      expect(files._component.dependencies[0].dependencies[0].files).to.eql([
        path.resolve(__dirname, 'fixtures', 'default',
          'bower_components', 'jquery', 'dist', 'jquery.min.js')
      ]);
    });

  });

  // COMPONENT TESTING
  describe('component', function () {

    it('should have a main component with full path to files', function () {
      cd('default');
      var files = new BowerFiles();
      expect(files._component.files).to.be.eql([
        path.resolve(__dirname, 'fixtures', 'default', 'dist', 'helpers.js'),
        path.resolve(__dirname, 'fixtures', 'default', 'dist', 'main.js'),
      ]);
    });

    it('should have a main component with dependencies', function () {
      cd('default');
      var files = new BowerFiles();
      expect(files._component.dependencies).to.have.length(2);
      expect(files._component.devDependencies).to.have.length(1);
      expect(files._component.dependencies[0].name).to.be('bootstrap');
      expect(files._component.dependencies[0].dir).to.be(
        path.resolve(__dirname, 'fixtures', 'default', 'bower_components')
      );
    });

    it('should handle symlinked components', function () {
      /* jshint maxstatements: false */
      cd('symlink');
      var symlinkDir = path.join(__dirname, 'fixtures', 'symlink');
      var src  = path.join(symlinkDir, 'angular');
      var dest = path.join(symlinkDir, 'bower_components', 'angular');
      var error;
      try {
        fs.symlinkSync(src, dest);
        var files = new BowerFiles();
        var ngRoute = files._component.dependencies[1];
        expect(ngRoute.dependencies[0]).to.be.ok();
        expect(ngRoute.dependencies[0].path).to.be(dest);
      } catch (err) {
        error = err;
      } finally {
        fs.unlinkSync(dest);
      }
      if (error) { throw error; }
    });

  });

  // FILES TESTING
  describe('files', function () {

    it('should not have duplicate files');

  });

});
